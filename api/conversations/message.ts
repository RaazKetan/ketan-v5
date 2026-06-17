import { guard, json } from "../sarvam/_shared";
import { readIdentity } from "../_shared/identity";
import { getSupabase, supabaseConfigured } from "../_shared/supabase";

export const config = { runtime: "edge" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROLES = new Set(["user", "agent"]);
const SOURCES = new Set(["text", "voice"]);
const MAX_TEXT = 4096;

type Body = {
  visitorId?: string;
  sessionId?: string;
  visitorMeta?: {
    language?: string;
    screenW?: number;
    screenH?: number;
    dpr?: number;
    referrer?: string;
  };
  role?: string;
  source?: string;
  text?: string;
};

export default async function handler(req: Request): Promise<Response> {
  const blocked = guard(req);
  if (blocked) return blocked;

  if (!supabaseConfigured()) {
    /* DB not provisioned — fail soft so the chat UI keeps working. The
       client treats anything non-2xx as no-op. */
    return json({ error: "Logging disabled" }, 503);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  /* ---- Validate shape ---- */
  const visitorId = String(body.visitorId || "");
  const sessionId = String(body.sessionId || "");
  const role = String(body.role || "");
  const source = String(body.source || "");
  const text = String(body.text || "").slice(0, MAX_TEXT).trim();

  if (!UUID_RE.test(visitorId)) return json({ error: "Bad visitorId" }, 400);
  if (!UUID_RE.test(sessionId)) return json({ error: "Bad sessionId" }, 400);
  if (!ROLES.has(role)) return json({ error: "Bad role" }, 400);
  if (!SOURCES.has(source)) return json({ error: "Bad source" }, 400);
  if (!text) return json({ error: "Empty text" }, 400);

  const supabase = getSupabase()!;
  const id = await readIdentity(req);

  /* ---- Upsert visitor ----
     If row exists: bump last_seen, refresh geo/UA so we get the most
     recent values (visitors travel, change browsers). Increment
     visit_count only when the call carries fresh visitorMeta (i.e. it's
     the first message of a new session). */
  const isFreshSession = !!body.visitorMeta;
  const visitorMeta = body.visitorMeta || {};

  const visitorUpsert: Record<string, unknown> = {
    id: visitorId,
    last_seen_at: new Date().toISOString(),
    ip: id.ip,
    ip_hash: id.ipHash,
    ua: id.ua.ua,
    ua_browser: id.ua.browser,
    ua_os: id.ua.os,
    ua_device: id.ua.device,
    language: id.language || visitorMeta.language || null,
    country: id.geo.country,
    region: id.geo.region,
    city: id.geo.city,
    timezone: id.geo.timezone,
    latitude: id.geo.latitude,
    longitude: id.geo.longitude,
  };
  if (isFreshSession) {
    visitorUpsert.screen_w = visitorMeta.screenW ?? null;
    visitorUpsert.screen_h = visitorMeta.screenH ?? null;
    visitorUpsert.dpr = visitorMeta.dpr ?? null;
    visitorUpsert.referrer = visitorMeta.referrer ?? null;
  }

  const { error: vErr } = await supabase
    .from("visitors")
    .upsert(visitorUpsert, { onConflict: "id" });
  if (vErr) {
    console.error("[conversations] visitor upsert", vErr);
    return json({ error: "DB error" }, 500);
  }

  if (isFreshSession) {
    /* Bump visit_count separately so concurrent upserts don't clobber it.
       Best-effort: ignore failures. */
    await supabase.rpc("increment_visit_count", { v: visitorId }).then(
      () => {},
      () => {
        /* RPC may not exist; fall back to a read-modify-write. */
        supabase
          .from("visitors")
          .select("visit_count")
          .eq("id", visitorId)
          .single()
          .then(({ data }) => {
            if (data) {
              supabase
                .from("visitors")
                .update({ visit_count: (data.visit_count ?? 1) + 1 })
                .eq("id", visitorId);
            }
          });
      }
    );
  }

  /* ---- Upsert session ----
     channel goes 'text' → 'voice' → 'both' as different sources arrive.
     Use a SELECT first to know whether to widen, since we can't easily
     express "channel = case when channel <> source then 'both' else …"
     in upsert. */
  const { data: existingSession } = await supabase
    .from("sessions")
    .select("channel")
    .eq("id", sessionId)
    .maybeSingle();

  let nextChannel = source;
  if (existingSession?.channel && existingSession.channel !== source) {
    nextChannel = "both";
  }

  const { error: sErr } = await supabase.from("sessions").upsert(
    {
      id: sessionId,
      visitor_id: visitorId,
      channel: nextChannel,
      page_path: isFreshSession ? new URL(req.url).pathname : undefined,
    },
    { onConflict: "id" }
  );
  if (sErr) {
    console.error("[conversations] session upsert", sErr);
    return json({ error: "DB error" }, 500);
  }

  /* ---- Insert message ---- */
  const { error: mErr } = await supabase.from("messages").insert({
    session_id: sessionId,
    visitor_id: visitorId,
    role,
    source,
    text,
    country: id.geo.country,
    city: id.geo.city,
  });
  if (mErr) {
    console.error("[conversations] message insert", mErr);
    return json({ error: "DB error" }, 500);
  }

  return json({ ok: true });
}
