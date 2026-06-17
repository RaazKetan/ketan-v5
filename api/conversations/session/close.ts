import { clientIp, json, checkOrigin } from "../../sarvam/_shared";
import { limit } from "../../_shared/limits";
import { readJson, isUuid } from "../../_shared/validate";
import { getSupabase, supabaseConfigured } from "../../_shared/supabase";

export const config = { runtime: "edge" };

const MAX_BODY_BYTES = 1024;

type Body = { sessionId?: unknown };

/* Best-effort session close. Called via `navigator.sendBeacon` on
   pagehide / visibilitychange=hidden. Tolerates duplicates: only sets
   ended_at when it's still null. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const originDenied = checkOrigin(req);
  if (originDenied) return originDenied;

  const ip = clientIp(req);
  if (!limit("close", ip)) return json({ error: "Rate limit exceeded" }, 429);

  if (!supabaseConfigured()) return json({ ok: true });

  const parsed = await readJson<Body>(req, MAX_BODY_BYTES);
  if (!parsed.ok) return parsed.res;
  if (!isUuid(parsed.body.sessionId)) {
    return json({ error: "Bad sessionId" }, 400);
  }

  const supabase = getSupabase()!;
  const { error } = await supabase
    .from("sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", parsed.body.sessionId)
    .is("ended_at", null);

  if (error) {
    console.error("[conversations] session close", error);
    return json({ error: "DB error" }, 500);
  }

  return json({ ok: true }, 200, { "Cache-Control": "no-store, max-age=0" });
}
