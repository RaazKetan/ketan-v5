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

/* GET /api/admin/analytics?range=24h|7d|30d
   One mega-aggregator. Pulls fact rows from every table in the time
   window, computes totals + top-Ns + daily series + spike check in JS.
   Lean enough that one call powers the entire /admin dashboard. */
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
  const sinceMs = Date.now() - windowMs;
  const since = new Date(sinceMs).toISOString();

  const supabase = getSupabase()!;

  /* Pull fact rows. We limit each table to 5000 rows per window — at
     this size in-JS aggregation is faster than nine separate SQL
     aggregates, and 5k events / pageviews easily covers a 30-day window
     on a personal site. */
  const [pvRes, evRes, msgRes, sessRes, errRes] = await Promise.all([
    supabase
      .from("page_views")
      .select(
        "ts, visitor_id, session_id, path, host, referrer, utm_source, utm_medium, utm_campaign, country, region, city, ua_browser, ua_os, ua_device"
      )
      .gte("ts", since)
      .order("ts", { ascending: false })
      .limit(5000),
    supabase
      .from("events")
      .select("ts, name, path, country, props")
      .gte("ts", since)
      .order("ts", { ascending: false })
      .limit(5000),
    supabase
      .from("messages")
      .select("ts, role, source, session_id, visitor_id")
      .gte("ts", since)
      .order("ts", { ascending: false })
      .limit(5000),
    supabase
      .from("sessions")
      .select(
        "id, visitor_id, started_at, ended_at, channel, page_path, visitors:visitor_id (country, city, ua_browser, ua_os, ua_device)"
      )
      .gte("started_at", since)
      .order("started_at", { ascending: false })
      .limit(2000),
    supabase
      .from("api_errors")
      .select("ts, endpoint, status, message")
      .gte("ts", since)
      .order("ts", { ascending: false })
      .limit(1000),
  ]);

  if (pvRes.error || evRes.error || msgRes.error || sessRes.error || errRes.error) {
    console.error("[analytics] fetch", {
      pv: pvRes.error,
      ev: evRes.error,
      msg: msgRes.error,
      sess: sessRes.error,
      err: errRes.error,
    });
    return json({ error: "DB error" }, 500);
  }

  const pageViews = pvRes.data || [];
  const events = evRes.data || [];
  const messages = msgRes.data || [];
  const sessions = sessRes.data || [];
  const apiErrors = errRes.data || [];

  /* ------- overview totals ------- */
  const uniqueVisitors = new Set(
    pageViews.map((p) => p.visitor_id).filter(Boolean)
  ).size;
  const totalPageViews = pageViews.length;
  const totalSessions = sessions.length;
  const totalMessages = messages.length;
  const totalEvents = events.length;
  const totalApiErrors = apiErrors.length;

  /* bounce rate = sessions with ≤1 page view / total sessions */
  const viewsBySession = new Map<string, number>();
  for (const p of pageViews) {
    const sid = p.session_id as string | null;
    if (!sid) continue;
    viewsBySession.set(sid, (viewsBySession.get(sid) || 0) + 1);
  }
  const bouncedSessions = sessions.filter(
    (s) => (viewsBySession.get(s.id as string) || 0) <= 1
  ).length;
  const bounceRate =
    totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

  /* avg session duration (ended_at - started_at) where ended_at exists */
  const closedDurations = sessions
    .filter((s) => s.started_at && s.ended_at)
    .map(
      (s) =>
        new Date(s.ended_at as string).getTime() -
        new Date(s.started_at as string).getTime()
    )
    .filter((ms) => ms > 0 && ms < 2 * 60 * 60 * 1000); /* drop >2h outliers */
  const avgSessionMs =
    closedDurations.length > 0
      ? Math.round(
          closedDurations.reduce((a, b) => a + b, 0) / closedDurations.length
        )
      : 0;

  /* ------- top lists ------- */
  const tally = <T extends Record<string, unknown>>(
    rows: T[],
    pick: (r: T) => string | null | undefined,
    cap = 10
  ) => {
    const m: Record<string, number> = {};
    for (const r of rows) {
      const v = pick(r);
      if (!v) continue;
      m[v] = (m[v] || 0) + 1;
    }
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, cap)
      .map(([name, count]) => ({ name, count }));
  };

  const topPages = tally(pageViews, (p) => p.path as string);
  const topCountries = tally(pageViews, (p) => p.country as string);
  const topCities = tally(pageViews, (p) => p.city as string);
  const topRegions = tally(pageViews, (p) => p.region as string);
  const topBrowsers = tally(pageViews, (p) => p.ua_browser as string);
  const topOS = tally(pageViews, (p) => p.ua_os as string);
  const topDevices = tally(pageViews, (p) => p.ua_device as string);
  const topHosts = tally(pageViews, (p) => p.host as string);
  const topReferrers = tally(pageViews, (p) => {
    const r = p.referrer as string | null;
    if (!r) return "(direct)";
    try {
      return new URL(r).hostname;
    } catch {
      return r;
    }
  });
  const topUtmSource = tally(pageViews, (p) => p.utm_source as string);
  const topUtmMedium = tally(pageViews, (p) => p.utm_medium as string);
  const topUtmCampaign = tally(pageViews, (p) => p.utm_campaign as string);
  const topEvents = tally(events, (e) => e.name as string);

  /* ------- visitors-per-page (unique not raw views) ------- */
  const visitorsByPage: Record<string, Set<string>> = {};
  for (const p of pageViews) {
    const path = (p.path as string) || "(unknown)";
    const vid = (p.visitor_id as string) || null;
    if (!vid) continue;
    if (!visitorsByPage[path]) visitorsByPage[path] = new Set();
    visitorsByPage[path].add(vid);
  }
  const uniqueVisitorsPerPage = Object.entries(visitorsByPage)
    .map(([name, set]) => ({ name, count: set.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  /* ------- daily series for sparkline ------- */
  const bucketDays =
    range === "24h" ? 1 : range === "7d" ? 7 : 30;
  const dayCounts = (rows: Array<{ ts?: unknown; started_at?: unknown }>) => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      const stamp = (r.ts ?? r.started_at) as string | undefined;
      if (!stamp) continue;
      const day = String(stamp).slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    }
    /* fill missing days so the sparkline is continuous */
    const out: Array<{ date: string; count: number }> = [];
    for (let i = bucketDays - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      out.push({ date: d, count: map[d] || 0 });
    }
    return out;
  };

  const pageViewsByDay = dayCounts(pageViews);
  const visitorsByDay = (() => {
    const seenByDay: Record<string, Set<string>> = {};
    for (const p of pageViews) {
      const stamp = p.ts as string | undefined;
      const vid = p.visitor_id as string | null;
      if (!stamp || !vid) continue;
      const day = stamp.slice(0, 10);
      if (!seenByDay[day]) seenByDay[day] = new Set();
      seenByDay[day].add(vid);
    }
    const out: Array<{ date: string; count: number }> = [];
    for (let i = bucketDays - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      out.push({ date: d, count: seenByDay[d]?.size || 0 });
    }
    return out;
  })();
  const messagesByDay = dayCounts(messages);
  const errorsByDay = dayCounts(apiErrors);

  /* ------- spike detection -------
     Compare today's count to the average of the prior days in window.
     >2× avg → spike. Returns the ratio so the UI can show a badge. */
  const spike = (series: Array<{ date: string; count: number }>) => {
    if (series.length < 2) return { ratio: 1, isSpike: false };
    const today = series[series.length - 1]!.count;
    const prior = series.slice(0, -1);
    const avg =
      prior.length > 0
        ? prior.reduce((a, b) => a + b.count, 0) / prior.length
        : 0;
    const ratio = avg > 0 ? today / avg : today > 0 ? 99 : 1;
    return { ratio: Math.round(ratio * 10) / 10, isSpike: ratio >= 2 };
  };

  const spikes = {
    pageViews: spike(pageViewsByDay),
    visitors: spike(visitorsByDay),
    errors: spike(errorsByDay),
  };

  /* ------- API health -------
     Error rate = api_errors / (api_errors + successful events + pageviews + messages)
     Reasonable proxy since every successful request flows through at least
     one of those tables. */
  const totalRequests =
    totalApiErrors + totalEvents + totalPageViews + totalMessages;
  const errorRate =
    totalRequests > 0
      ? Math.round((totalApiErrors / totalRequests) * 1000) / 10
      : 0;
  const recentErrors = apiErrors.slice(0, 20).map((e) => ({
    ts: e.ts,
    endpoint: e.endpoint,
    status: e.status,
    message: String(e.message || "").slice(0, 200),
  }));

  /* ------- channel mix from sessions ------- */
  const channelMix: Record<string, number> = {};
  for (const s of sessions) {
    const c = (s.channel as string) || "unknown";
    channelMix[c] = (channelMix[c] || 0) + 1;
  }

  return json(
    {
      range,
      since,
      overview: {
        uniqueVisitors,
        totalPageViews,
        totalSessions,
        totalMessages,
        totalEvents,
        bounceRate,
        avgSessionMs,
        errorRate,
      },
      timeseries: {
        pageViewsByDay,
        visitorsByDay,
        messagesByDay,
        errorsByDay,
      },
      spikes,
      top: {
        pages: topPages,
        countries: topCountries,
        cities: topCities,
        regions: topRegions,
        browsers: topBrowsers,
        os: topOS,
        devices: topDevices,
        hosts: topHosts,
        referrers: topReferrers,
        utmSource: topUtmSource,
        utmMedium: topUtmMedium,
        utmCampaign: topUtmCampaign,
        events: topEvents,
        visitorsPerPage: uniqueVisitorsPerPage,
      },
      channelMix,
      apiErrors: {
        total: totalApiErrors,
        rate: errorRate,
        recent: recentErrors,
      },
    },
    200,
    { "Cache-Control": "no-store, max-age=0" }
  );
}
