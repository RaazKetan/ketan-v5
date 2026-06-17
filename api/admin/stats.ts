import { json } from "../sarvam/_shared";
import { requireAdmin } from "../_shared/admin";
import { getSupabase, supabaseConfigured } from "../_shared/supabase";

export const config = { runtime: "edge" };

const RANGES: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/* GET /api/admin/stats?range=24h|7d|30d
   Returns aggregate counts: sessions, messages, unique visitors, top
   countries / cities / channels for the requested time window. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const fail = requireAdmin(req);
  if (fail) return fail;
  if (!supabaseConfigured()) return json({ error: "DB not configured" }, 503);

  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "7d";
  const windowMs = RANGES[range] ?? RANGES["7d"]!;
  const since = new Date(Date.now() - windowMs).toISOString();

  const supabase = getSupabase()!;

  /* Pull sessions joined with their visitor's geo. Aggregations happen
     in JS — datasets are small enough that 1000 rows is plenty. */
  const { data: sessions, error: sErr } = await supabase
    .from("sessions")
    .select(
      "id, visitor_id, started_at, channel, visitors:visitor_id (country, city, ua_browser, ua_os)"
    )
    .gte("started_at", since)
    .limit(2000);
  if (sErr) {
    console.error("[admin] stats sessions", sErr);
    return json({ error: "DB error" }, 500);
  }

  const { count: messageCount, error: mErr } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .gte("ts", since);
  if (mErr) {
    console.error("[admin] stats msg count", mErr);
    return json({ error: "DB error" }, 500);
  }

  const sessionCount = sessions?.length || 0;
  const uniqueVisitors = new Set(
    (sessions || []).map((s) => s.visitor_id as string)
  ).size;

  const topBy = (
    key: "country" | "city" | "ua_browser" | "ua_os"
  ): Array<{ name: string; count: number }> => {
    const counts: Record<string, number> = {};
    for (const s of sessions || []) {
      const v = (s as { visitors: unknown }).visitors as
        | Record<string, string | null>
        | null;
      const name = v?.[key];
      if (!name) continue;
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  };

  const channelMix: Record<string, number> = {};
  for (const s of sessions || []) {
    const c = (s.channel as string) || "unknown";
    channelMix[c] = (channelMix[c] || 0) + 1;
  }

  /* Daily series — bucket by UTC date. */
  const daily: Record<string, number> = {};
  for (const s of sessions || []) {
    const day = String(s.started_at).slice(0, 10);
    daily[day] = (daily[day] || 0) + 1;
  }
  const dailySeries = Object.entries(daily)
    .sort()
    .map(([date, count]) => ({ date, count }));

  return json({
    range,
    since,
    sessionCount,
    messageCount: messageCount || 0,
    uniqueVisitors,
    topCountries: topBy("country"),
    topCities: topBy("city"),
    topBrowsers: topBy("ua_browser"),
    topOS: topBy("ua_os"),
    channelMix,
    dailySeries,
  });
}
