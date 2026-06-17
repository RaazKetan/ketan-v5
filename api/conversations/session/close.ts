import { guard, json } from "../../sarvam/_shared";
import { getSupabase, supabaseConfigured } from "../../_shared/supabase";

export const config = { runtime: "edge" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* Best-effort session close. Called via `navigator.sendBeacon` on
   pagehide / visibilitychange=hidden. Tolerates duplicates: just sets
   ended_at = now() the first time, ignored on subsequent calls. */
export default async function handler(req: Request): Promise<Response> {
  const blocked = guard(req);
  if (blocked) return blocked;
  if (!supabaseConfigured()) return json({ ok: true });

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    /* sendBeacon may send a blob; accept that too. */
    try {
      const txt = await req.text();
      body = JSON.parse(txt) as { sessionId?: string };
    } catch {
      return json({ error: "Invalid body" }, 400);
    }
  }

  const sessionId = String(body.sessionId || "");
  if (!UUID_RE.test(sessionId)) return json({ error: "Bad sessionId" }, 400);

  const supabase = getSupabase()!;
  const { error } = await supabase
    .from("sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId)
    .is("ended_at", null);

  if (error) {
    console.error("[conversations] session close", error);
    return json({ error: "DB error" }, 500);
  }

  return json({ ok: true });
}
