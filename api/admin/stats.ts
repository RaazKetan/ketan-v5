import { clientIp, json } from "../sarvam/_shared";
import { limit } from "../_shared/limits";
import { requireAdmin } from "../_shared/admin";
import { getSupabase, supabaseConfigured } from "../_shared/supabase";

export const config = { runtime: "edge" };

const RANGES: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  if (!limit("adminRead", clientIp(req))) {
    return json({ error: "Rate limit exceeded" }, 429);
  }
  const fail = await requireAdmin(req);
  if (fail) return fail;
  if (!supabaseConfigured()) return json({ error: "DB not configured" }, 503);

  const url = new URL(req.url);
  const rangeKey = url.searchParams.get("range") || "7d";
  const range = rangeKey in RANGES ? rangeKey : "7d";
  const windowMs = RANGES[range]!;
  const since = new Date(Date.now() - windowMs).toISOString();

  const supabase = getSupabase()!;

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

  const daily: Record<string, number> = {};
  for (const s of sessions || []) {
    const day = String(s.started_at).slice(0, 10);
    daily[day] = (daily[day] || 0) + 1;
  }
  const dailySeries = Object.entries(daily)
    .sort()
    .map(([date, count]) => ({ date, count }));

  return json(
    {
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
    },
    200,
    { "Cache-Control": "no-store, max-age=0" }
  );
}
