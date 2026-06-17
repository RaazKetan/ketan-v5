import { clientIp, json } from "../sarvam/_shared";
import { limit } from "../_shared/limits";
import { requireAdmin } from "../_shared/admin";
import { getSupabase, supabaseConfigured } from "../_shared/supabase";

export const config = { runtime: "edge" };

const MAX_LIMIT = 100;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; // loose ISO sanity

/* GET /api/admin/conversations?limit=50&cursor=<ISO timestamp> */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  if (!limit("adminRead", clientIp(req))) {
    return json({ error: "Rate limit exceeded" }, 429);
  }
  const fail = requireAdmin(req);
  if (fail) return fail;
  if (!supabaseConfigured()) return json({ error: "DB not configured" }, 503);

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 50);
  const lim = Number.isFinite(limitParam)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(limitParam)))
    : 50;
  const cursorRaw = url.searchParams.get("cursor");
  const cursor = cursorRaw && ISO_RE.test(cursorRaw) ? cursorRaw : null;

  const supabase = getSupabase()!;

  let q = supabase
    .from("sessions")
    .select(
      `id, started_at, ended_at, channel, page_path,
       visitors:visitor_id (country, city, ua_browser, ua_os, ua_device)`
    )
    .order("started_at", { ascending: false })
    .limit(lim);

  if (cursor) q = q.lt("started_at", cursor);

  const { data: sessions, error } = await q;
  if (error) {
    console.error("[admin] conversations list", error);
    return json({ error: "DB error" }, 500);
  }

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
      if (previews[sid].last === null) {
        previews[sid].last = String(m.text || "").slice(0, 240);
      }
    }
  }

  const rows = (sessions || []).map((s) => {
    const visitor = (s as { visitors: unknown }).visitors as
      | {
          country: string | null;
          city: string | null;
          ua_browser: string | null;
          ua_os: string | null;
          ua_device: string | null;
        }
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
    rows.length === lim ? rows[rows.length - 1]!.startedAt : null;

  return json({ rows, nextCursor }, 200, {
    "Cache-Control": "no-store, max-age=0",
  });
}
