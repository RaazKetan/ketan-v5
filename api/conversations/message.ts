import { json, clientIp, checkOrigin } from "../sarvam/_shared.js";
import { limit } from "../_shared/limits.js";
import {
  readJson,
  isUuid,
  isString,
  isOneOf,
  sanitizeText,
  isFiniteInt,
  isFiniteNumber,
} from "../_shared/validate.js";
import { readIdentity } from "../_shared/identity.js";
import { getSupabase, supabaseConfigured } from "../_shared/supabase.js";

export const config = { runtime: "edge" };

const ROLES = new Set(["user", "agent"] as const);
const SOURCES = new Set(["text", "voice"] as const);

const MAX_BODY_BYTES = 16 * 1024; // 16 KB
const MAX_TEXT = 4096;
const MAX_VISITOR_META_STRING = 500;

type Body = {
  visitorId?: unknown;
  sessionId?: unknown;
  visitorMeta?: unknown;
  role?: unknown;
  source?: unknown;
  text?: unknown;
};

type VisitorMeta = {
  language?: string;
  screenW?: number;
  screenH?: number;
  dpr?: number;
  referrer?: string;
  pagePath?: string;
};

/* Validate visitorMeta separately so each field has its own cap and
   bad-faith metadata can't blow up the request. Returns null on any
   issue, an object on success. */
function validateVisitorMeta(v: unknown): VisitorMeta | null {
  if (typeof v !== "object" || v === null) return null;
  const m = v as Record<string, unknown>;
  const out: VisitorMeta = {};
  if (typeof m.language === "string" && m.language.length <= MAX_VISITOR_META_STRING) {
    out.language = m.language;
  }
  if (isFiniteInt(m.screenW, 0, 32_000)) out.screenW = m.screenW as number;
  if (isFiniteInt(m.screenH, 0, 32_000)) out.screenH = m.screenH as number;
  if (isFiniteNumber(m.dpr, 0, 10)) out.dpr = m.dpr as number;
  if (typeof m.referrer === "string" && m.referrer.length <= MAX_VISITOR_META_STRING) {
    out.referrer = m.referrer;
  }
  /* page_path must start with '/' and be reasonable length; refuse
     anything that looks like an absolute URL to avoid open-redirect-
     style attribution on the admin side. */
  if (
    typeof m.pagePath === "string" &&
    m.pagePath.length > 0 &&
    m.pagePath.length <= MAX_VISITOR_META_STRING &&
    m.pagePath.startsWith("/") &&
    !m.pagePath.startsWith("//")
  ) {
    out.pagePath = m.pagePath;
  }
  return out;
}

export default async function handler(req: Request): Promise<Response> {
  /* --- method + origin --- */
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const originDenied = checkOrigin(req);
  if (originDenied) return originDenied;

  /* --- rate limit (dedicated 'message' bucket) --- */
  const ip = clientIp(req);
  if (!limit("message", ip)) {
    return json({ error: "Rate limit exceeded" }, 429);
  }

  /* --- DB readiness --- */
  if (!supabaseConfigured()) {
    /* Soft-fail: client treats anything non-2xx as no-op, chat keeps
       working. Returning 503 makes the disabled state explicit. */
    return json({ error: "Logging disabled" }, 503);
  }

  /* --- read + validate body --- */
  const parsed = await readJson<Body>(req, MAX_BODY_BYTES);
  if (!parsed.ok) return parsed.res;
  const body = parsed.body;

  if (!isUuid(body.visitorId)) return json({ error: "Bad visitorId" }, 400);
  if (!isUuid(body.sessionId)) return json({ error: "Bad sessionId" }, 400);
  if (!isOneOf(body.role, ROLES)) return json({ error: "Bad role" }, 400);
  if (!isOneOf(body.source, SOURCES)) return json({ error: "Bad source" }, 400);
  if (!isString(body.text, MAX_TEXT)) return json({ error: "Bad text" }, 400);

  const text = sanitizeText(String(body.text)).slice(0, MAX_TEXT);
  if (!text) return json({ error: "Empty text" }, 400);

  const visitorMeta = validateVisitorMeta(body.visitorMeta);
  const isFreshSession = !!visitorMeta;

  /* --- identity from request --- */
  const id = await readIdentity(req);
  const supabase = getSupabase()!;

  /* --- upsert visitor ---
     If row exists: bump last_seen + refresh geo/UA (visitors travel and
     swap browsers). Increment visit_count only on a fresh session. */
  const visitorUpsert: Record<string, unknown> = {
    id: body.visitorId,
    last_seen_at: new Date().toISOString(),
    ip: id.ip,
    ip_hash: id.ipHash,
    ua: id.ua.ua,
    ua_browser: id.ua.browser,
    ua_os: id.ua.os,
    ua_device: id.ua.device,
    language: id.language || visitorMeta?.language || null,
    country: id.geo.country,
    region: id.geo.region,
    city: id.geo.city,
    timezone: id.geo.timezone,
    latitude: id.geo.latitude,
    longitude: id.geo.longitude,
  };
  if (isFreshSession && visitorMeta) {
    if (visitorMeta.screenW !== undefined) visitorUpsert.screen_w = visitorMeta.screenW;
    if (visitorMeta.screenH !== undefined) visitorUpsert.screen_h = visitorMeta.screenH;
    if (visitorMeta.dpr !== undefined) visitorUpsert.dpr = visitorMeta.dpr;
    if (visitorMeta.referrer !== undefined) visitorUpsert.referrer = visitorMeta.referrer;
  }

  const { error: vErr } = await supabase
    .from("visitors")
    .upsert(visitorUpsert, { onConflict: "id" });
  if (vErr) {
    console.error("[conversations] visitor upsert", vErr);
    return json({ error: "DB error" }, 500);
  }

  if (isFreshSession) {
    /* Best-effort bump; ignore failures. */
    const { data } = await supabase
      .from("visitors")
      .select("visit_count")
      .eq("id", body.visitorId)
      .single();
    if (data) {
      await supabase
        .from("visitors")
        .update({ visit_count: (data.visit_count ?? 1) + 1 })
        .eq("id", body.visitorId);
    }
  }

  /* --- upsert session ---
     Widen channel 'text' → 'voice' → 'both' as different sources arrive. */
  const { data: existingSession } = await supabase
    .from("sessions")
    .select("channel")
    .eq("id", body.sessionId)
    .maybeSingle();

  let nextChannel: string = body.source as string;
  if (existingSession?.channel && existingSession.channel !== body.source) {
    nextChannel = "both";
  }

  const sessionUpsert: Record<string, unknown> = {
    id: body.sessionId,
    visitor_id: body.visitorId,
    channel: nextChannel,
  };
  /* page_path = the page the visitor was on when the session began.
     Comes from the client (window.location.pathname) inside visitorMeta,
     NOT from req.url which would always be the API endpoint path. */
  if (isFreshSession && visitorMeta?.pagePath) {
    sessionUpsert.page_path = visitorMeta.pagePath;
  }

  const { error: sErr } = await supabase
    .from("sessions")
    .upsert(sessionUpsert, { onConflict: "id" });
  if (sErr) {
    console.error("[conversations] session upsert", sErr);
    return json({ error: "DB error" }, 500);
  }

  /* --- insert message --- */
  const { error: mErr } = await supabase.from("messages").insert({
    session_id: body.sessionId,
    visitor_id: body.visitorId,
    role: body.role,
    source: body.source,
    text,
    country: id.geo.country,
    city: id.geo.city,
  });
  if (mErr) {
    console.error("[conversations] message insert", mErr);
    return json({ error: "DB error" }, 500);
  }

  return json(
    { ok: true },
    200,
    /* Tell every intermediate cache to keep its hands off. */
    { "Cache-Control": "no-store, max-age=0" }
  );
}
