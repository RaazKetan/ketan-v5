import { clientIp, json } from "../sarvam/_shared.js";
import { limit } from "../_shared/limits.js";
import { requireAdmin } from "../_shared/admin.js";
import { getSupabase, supabaseConfigured } from "../_shared/supabase.js";
import { parseUA } from "../_shared/identity.js";

export const config = { runtime: "edge" };

const MAX_LIMIT = 100;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; // loose ISO sanity

/* GET /api/admin/conversations?limit=50&cursor=<ISO timestamp> */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  if (!limit("adminRead", clientIp(req))) {
    return json({ error: "Rate limit exceeded" }, 429);
  }
  const fail = await requireAdmin(req);
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
       visitors:visitor_id (
         id, ip, ip_hash, ua, ua_browser, ua_os, ua_device,
         country, region, city, timezone, language,
         screen_w, screen_h, visit_count, referrer
       )`
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
          id: string | null;
          ip: string | null;
          ip_hash: string | null;
          ua: string | null;
          ua_browser: string | null;
          ua_os: string | null;
          ua_device: string | null;
          country: string | null;
          region: string | null;
          city: string | null;
          timezone: string | null;
          language: string | null;
          screen_w: number | null;
          screen_h: number | null;
          visit_count: number | null;
          referrer: string | null;
        }
      | null;
    const p = previews[s.id as string] || { count: 0, last: null };
    /* Parse the stored UA to recover a device model on the fly (e.g.
       "iPhone (iOS 17)" or "Samsung SM-G990B"). Storing it back to the
       visitors row would mean a schema migration; computing here is free. */
    const model = visitor?.ua ? parseUA(visitor.ua).model : null;
    return {
      id: s.id,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      channel: s.channel,
      pagePath: s.page_path,
      visitorId: visitor?.id ?? null,
      ip: visitor?.ip ?? null,
      ipHash: visitor?.ip_hash ?? null,
      country: visitor?.country ?? null,
      region: visitor?.region ?? null,
      city: visitor?.city ?? null,
      timezone: visitor?.timezone ?? null,
      language: visitor?.language ?? null,
      browser: visitor?.ua_browser ?? null,
      os: visitor?.ua_os ?? null,
      device: visitor?.ua_device ?? null,
      model,
      screenW: visitor?.screen_w ?? null,
      screenH: visitor?.screen_h ?? null,
      visitCount: visitor?.visit_count ?? null,
      referrer: visitor?.referrer ?? null,
      messageCount: p.count,
      lastMessage: p.last,
    };
  });

  /* Recent Conversations table is for chats only — the analytics tab
     already shows page-view-only sessions. Filter empty sessions so
     the operator's view doesn't fill up with browser pings. */
  const chatRows = rows.filter((r) => (r.messageCount ?? 0) > 0);

  const nextCursor =
    chatRows.length === lim ? chatRows[chatRows.length - 1]!.startedAt : null;

  return json({ rows: chatRows, nextCursor }, 200, {
    "Cache-Control": "no-store, max-age=0",
  });
}
