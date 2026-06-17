import { json } from "../sarvam/_shared";
import { requireAdmin } from "../_shared/admin";
import { getSupabase, supabaseConfigured } from "../_shared/supabase";

export const config = { runtime: "edge" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* GET /api/admin/session?id=<uuid>
   Returns full visitor record + full message thread for a session.
   Uses ?id= (query param) instead of /:id (path) to keep the dev plugin
   simple — no dynamic-segment routing needed. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const fail = requireAdmin(req);
  if (fail) return fail;
  if (!supabaseConfigured()) return json({ error: "DB not configured" }, 503);

  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  if (!UUID_RE.test(id)) return json({ error: "Bad session id" }, 400);

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

  return json({ session, messages: messages || [] });
}
