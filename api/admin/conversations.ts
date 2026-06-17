import { json } from "../sarvam/_shared";
import { requireAdmin } from "../_shared/admin";
import { getSupabase, supabaseConfigured } from "../_shared/supabase";

export const config = { runtime: "edge" };

const MAX_LIMIT = 100;

/* GET /api/admin/conversations?limit=50&cursor=<ISO timestamp>
   Returns most recent sessions with metadata + preview of the last
   message. Cursor-paginated by started_at descending — pass the
   started_at of the last row back as `cursor` for the next page. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const fail = requireAdmin(req);
  if (fail) return fail;
  if (!supabaseConfigured()) return json({ error: "DB not configured" }, 503);

  const url = new URL(req.url);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(url.searchParams.get("limit") || 50))
  );
  const cursor = url.searchParams.get("cursor");

  const supabase = getSupabase()!;

  /* Pull sessions joined with visitor geo + a count of messages. The
     last-message preview is fetched separately to keep this query lean. */
  let q = supabase
    .from("sessions")
    .select(
      `id, started_at, ended_at, channel, page_path,
       visitors:visitor_id (country, city, ua_browser, ua_os, ua_device)`
    )
    .order("started_at", { ascending: false })
    .limit(limit);

  if (cursor) q = q.lt("started_at", cursor);

  const { data: sessions, error } = await q;
  if (error) {
    console.error("[admin] conversations list", error);
    return json({ error: "DB error" }, 500);
  }

  /* Hydrate each session with message_count + last message preview. */
  const ids = (sessions || []).map((s: { id: string }) => s.id);
  const previews: Record<string, { count: number; last: string | null }> = {};
  if (ids.length) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("session_id, text, ts")
      .in("session_id", ids)
      .order("ts", { ascending: false });
    for (const m of msgs || []) {
      const sid = m.session_id as string;
      if (!previews[sid]) previews[sid] = { count: 0, last: null };
      previews[sid].count += 1;
      if (previews[sid].last === null) previews[sid].last = String(m.text || "").slice(0, 240);
    }
  }

  const rows = (sessions || []).map((s) => {
    const visitor = (s as { visitors: unknown }).visitors as
      | { country: string | null; city: string | null; ua_browser: string | null; ua_os: string | null; ua_device: string | null }
      | null;
    const p = previews[s.id as string] || { count: 0, last: null };
    return {
      id: s.id,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      channel: s.channel,
      pagePath: s.page_path,
      country: visitor?.country ?? null,
      city: visitor?.city ?? null,
      browser: visitor?.ua_browser ?? null,
      os: visitor?.ua_os ?? null,
      device: visitor?.ua_device ?? null,
      messageCount: p.count,
      lastMessage: p.last,
    };
  });

  const nextCursor =
    rows.length === limit ? rows[rows.length - 1]!.startedAt : null;

  return json({ rows, nextCursor });
}
