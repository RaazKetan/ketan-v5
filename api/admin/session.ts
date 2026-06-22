import { clientIp, json } from "../sarvam/_shared.js";
import { limit } from "../_shared/limits.js";
import { isUuid } from "../_shared/validate.js";
import { requireAdmin } from "../_shared/admin.js";
import { getSupabase, supabaseConfigured } from "../_shared/supabase.js";
import { parseUA } from "../_shared/identity.js";

export const config = { runtime: "edge" };

/* GET /api/admin/session?id=<uuid>
   Returns full visitor record + full message thread for a session. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  if (!limit("adminRead", clientIp(req))) {
    return json({ error: "Rate limit exceeded" }, 429);
  }
  const fail = await requireAdmin(req);
  if (fail) return fail;
  if (!supabaseConfigured()) return json({ error: "DB not configured" }, 503);

  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  if (!isUuid(id)) return json({ error: "Bad session id" }, 400);

  const supabase = getSupabase()!;

  const { data: session, error: sErr } = await supabase
    .from("sessions")
    .select("*, visitors:visitor_id (*)")
    .eq("id", id)
    .maybeSingle();
  if (sErr) {
    console.error("[admin] session get", sErr);
    return json({ error: "DB error" }, 500);
  }
  if (!session) return json({ error: "Not found" }, 404);

  const { data: messages, error: mErr } = await supabase
    .from("messages")
    .select("id, role, source, text, ts")
    .eq("session_id", id)
    .order("ts", { ascending: true });
  if (mErr) {
    console.error("[admin] session messages", mErr);
    return json({ error: "DB error" }, 500);
  }

  /* Attach device model derived from the stored UA so the drawer can
     show it without the client having to know how to parse User-Agent. */
  const visitor = (session as { visitors: unknown }).visitors as
    | { ua: string | null }
    | null;
  const model = visitor?.ua ? parseUA(visitor.ua).model : null;

  return json(
    { session, messages: messages || [], visitorModel: model },
    200,
    { "Cache-Control": "no-store, max-age=0" }
  );
}
