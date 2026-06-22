import React, { useEffect, useState } from "react";
import {
  NumberTicker,
  MagicCard,
  AnimatedList,
  AnimatedGradientText,
  Sparkline,
} from "@/components/magicui";

export type Range = "24h" | "7d" | "30d";

type TopRow = { name: string; count: number };

type Analytics = {
  range: string;
  since: string;
  overview: {
    uniqueVisitors: number;
    totalPageViews: number;
    totalSessions: number;
    totalMessages: number;
    totalEvents: number;
    bounceRate: number;
    avgSessionMs: number;
    errorRate: number;
  };
  timeseries: {
    pageViewsByDay: Array<{ date: string; count: number }>;
    visitorsByDay: Array<{ date: string; count: number }>;
    messagesByDay: Array<{ date: string; count: number }>;
    errorsByDay: Array<{ date: string; count: number }>;
  };
  spikes: {
    pageViews: { ratio: number; isSpike: boolean };
    visitors: { ratio: number; isSpike: boolean };
    errors: { ratio: number; isSpike: boolean };
  };
  top: {
    pages: TopRow[];
    countries: TopRow[];
    cities: TopRow[];
    regions: TopRow[];
    browsers: TopRow[];
    os: TopRow[];
    devices: TopRow[];
    hosts: TopRow[];
    referrers: TopRow[];
    utmSource: TopRow[];
    utmMedium: TopRow[];
    utmCampaign: TopRow[];
    events: TopRow[];
    visitorsPerPage: TopRow[];
  };
  channelMix: Record<string, number>;
  apiErrors: {
    total: number;
    rate: number;
    recent: Array<{
      ts: string;
      endpoint: string;
      status: number;
      message: string;
    }>;
  };
};

type Props = {
  range: Range;
  /* Called when an admin API responds 401 — bubbles up so the dashboard
     can flip back to the login screen instead of showing broken cards. */
  onUnauthorized?: () => void;
};

const fmtMs = (ms: number) => {
  if (ms <= 0) return "-";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.round(m / 60)}h ${m % 60}m`;
};

const FLAG: Record<string, string> = {
  IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", CA: "🇨🇦",
  AU: "🇦🇺", JP: "🇯🇵", SG: "🇸🇬", AE: "🇦🇪", PK: "🇵🇰", BD: "🇧🇩",
  NL: "🇳🇱", BR: "🇧🇷", IT: "🇮🇹", ES: "🇪🇸", IE: "🇮🇪", CN: "🇨🇳",
  ID: "🇮🇩", PH: "🇵🇭", KE: "🇰🇪", ZA: "🇿🇦",
};

export const AnalyticsView: React.FC<Props> = ({ range, onUnauthorized }) => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(`/api/admin/analytics?range=${range}`, {
          credentials: "same-origin",
        });
        if (r.status === 401) {
          /* Stale cookie / signed out elsewhere — kick back to login. */
          onUnauthorized?.();
          return;
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as Analytics;
        if (!cancelled) setData(j);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [range, onUnauthorized]);

  if (loading && !data) {
    return <div className="av-loading">Loading analytics…</div>;
  }
  if (err) {
    return <div className="av-error">Failed to load: {err}</div>;
  }
  if (!data) return null;

  const { overview, timeseries, spikes, top, channelMix, apiErrors } = data;

  return (
    <div className="av">
      {/* ---- Spike banners ---- */}
      {(spikes.pageViews.isSpike || spikes.visitors.isSpike || spikes.errors.isSpike) && (
        <div className="av-spikes">
          {spikes.visitors.isSpike && (
            <SpikeBadge label="Visitors spike" ratio={spikes.visitors.ratio} kind="up" />
          )}
          {spikes.pageViews.isSpike && (
            <SpikeBadge label="Page views spike" ratio={spikes.pageViews.ratio} kind="up" />
          )}
          {spikes.errors.isSpike && (
            <SpikeBadge label="Error rate spike" ratio={spikes.errors.ratio} kind="down" />
          )}
        </div>
      )}

      {/* ---- Overview stat cards ---- */}
      <div className="av-overview">
        <Stat label="Unique visitors" value={overview.uniqueVisitors} />
        <Stat label="Page views" value={overview.totalPageViews} />
        <Stat label="Sessions" value={overview.totalSessions} />
        <Stat label="Messages" value={overview.totalMessages} />
        <Stat label="Events fired" value={overview.totalEvents} />
        <Stat label="Bounce rate" value={overview.bounceRate} suffix="%" />
        <Stat label="Avg session" raw={fmtMs(overview.avgSessionMs)} />
        <Stat
          label="Error rate"
          value={overview.errorRate}
          suffix="%"
          warning={overview.errorRate > 1}
        />
      </div>

      {/* ---- Time-series row ---- */}
      <div className="av-trends">
        <TrendCard
          title="Visitors / day"
          data={timeseries.visitorsByDay}
          accent="var(--accent)"
        />
        <TrendCard
          title="Page views / day"
          data={timeseries.pageViewsByDay}
          accent="#2a9b6f"
        />
        <TrendCard
          title="Messages / day"
          data={timeseries.messagesByDay}
          accent="#f0a000"
        />
        <TrendCard
          title="Errors / day"
          data={timeseries.errorsByDay}
          accent="#e0432c"
        />
      </div>

      {/* ---- Top lists, 4 columns ---- */}
      <div className="av-grid">
        <TopList title="Top countries" rows={top.countries} flag />
        <TopList title="Top cities" rows={top.cities} />
        <TopList title="Top regions" rows={top.regions} />
        <TopList title="Top routes" rows={top.pages} mono />
        <TopList title="Unique visitors / page" rows={top.visitorsPerPage} mono />
        <TopList title="Top referrers" rows={top.referrers} mono />
        <TopList title="Top hosts" rows={top.hosts} mono />
        <TopList title="Devices" rows={top.devices} />
        <TopList title="Browsers" rows={top.browsers} />
        <TopList title="Operating systems" rows={top.os} />
        <TopList title="UTM source" rows={top.utmSource} mono />
        <TopList title="UTM medium" rows={top.utmMedium} mono />
        <TopList title="UTM campaign" rows={top.utmCampaign} mono />
        <TopList title="Top events" rows={top.events} mono />
      </div>

      {/* ---- Channel mix ---- */}
      <div className="av-channel">
        <div className="av-card-title">Conversation channels</div>
        <div className="av-channel-bar">
          {Object.entries(channelMix).map(([k, v]) => (
            <div
              key={k}
              className="av-channel-seg"
              style={{
                flex: v,
                background:
                  k === "voice"
                    ? "color-mix(in oklab, var(--accent) 70%, var(--ink))"
                    : k === "text"
                    ? "var(--accent)"
                    : "color-mix(in oklab, var(--accent) 30%, var(--bg-deep))",
              }}
              title={`${k}: ${v}`}
            >
              <span className="av-channel-lbl">
                {k} · {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- API health ---- */}
      <div className="av-api">
        <div className="av-card-title">
          <AnimatedGradientText>API health</AnimatedGradientText>
        </div>
        <div className="av-api-stats">
          <div>
            <div className="av-api-l">Error rate</div>
            <div className="av-api-v">
              {apiErrors.rate}
              <span className="av-api-suf">%</span>
            </div>
          </div>
          <div>
            <div className="av-api-l">Total errors</div>
            <div className="av-api-v">{apiErrors.total}</div>
          </div>
          <div>
            <div className="av-api-l">Status</div>
            <div className={`av-api-v ${apiErrors.rate > 5 ? "bad" : apiErrors.rate > 1 ? "warn" : "ok"}`}>
              {apiErrors.rate > 5 ? "Degraded" : apiErrors.rate > 1 ? "Watch" : "Healthy"}
            </div>
          </div>
        </div>
        {apiErrors.recent.length > 0 && (
          <details className="av-api-recent">
            <summary>Recent errors ({apiErrors.recent.length})</summary>
            <AnimatedList stagger={30}>
              {apiErrors.recent.map((e, i) => (
                <div key={i} className="av-api-row">
                  <span className="av-api-time">
                    {new Date(e.ts).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="av-api-status">{e.status}</span>
                  <span className="av-api-endpoint">{e.endpoint}</span>
                  <span className="av-api-msg">{e.message}</span>
                </div>
              ))}
            </AnimatedList>
          </details>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
};

/* ===== Sub-components ===== */

const Stat: React.FC<{
  label: string;
  value?: number;
  raw?: string;
  suffix?: string;
  warning?: boolean;
}> = ({ label, value, raw, suffix, warning }) => (
  <MagicCard className={warning ? "av-stat warn" : "av-stat"} intensity={0.18}>
    <div className="av-stat-l">{label}</div>
    <div className="av-stat-v">
      {raw ?? <NumberTicker value={value ?? 0} />}
      {suffix && <span className="av-stat-suf">{suffix}</span>}
    </div>
  </MagicCard>
);

const SpikeBadge: React.FC<{
  label: string;
  ratio: number;
  kind: "up" | "down";
}> = ({ label, ratio, kind }) => (
  <div className={`av-spike av-spike-${kind}`}>
    <span className="av-spike-icon">{kind === "up" ? "↗" : "↘"}</span>
    <span>
      {label} · <strong>{ratio}×</strong> vs avg
    </span>
  </div>
);

const TrendCard: React.FC<{
  title: string;
  data: Array<{ date: string; count: number }>;
  accent: string;
}> = ({ title, data, accent }) => {
  const total = data.reduce((a, b) => a + b.count, 0);
  return (
    <MagicCard className="av-trend">
      <div className="av-trend-head">
        <div className="av-trend-title">{title}</div>
        <div className="av-trend-total">
          <NumberTicker value={total} />
        </div>
      </div>
      <Sparkline data={data} color={accent} height={64} />
    </MagicCard>
  );
};

const TopList: React.FC<{
  title: string;
  rows: TopRow[];
  mono?: boolean;
  flag?: boolean;
}> = ({ title, rows, mono, flag }) => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <MagicCard className="av-toplist">
      <div className="av-card-title">{title}</div>
      {rows.length === 0 ? (
        <div className="av-empty">No data yet</div>
      ) : (
        <AnimatedList stagger={40}>
          {rows.map((r) => (
            <div key={r.name} className="av-row">
              <div className="av-row-name" title={r.name}>
                {flag && <span className="av-flag">{FLAG[r.name] || "🌐"}</span>}
                <span className={mono ? "av-mono" : ""}>{r.name}</span>
              </div>
              <div className="av-row-bar">
                <div
                  className="av-row-fill"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
              <div className="av-row-count">{r.count}</div>
            </div>
          ))}
        </AnimatedList>
      )}
    </MagicCard>
  );
};

const styles = `
  .av { display: flex; flex-direction: column; gap: 28px; }

  .av-loading, .av-error {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    padding: 32px 0;
  }
  .av-error { color: #e0432c; }

  /* spike badges */
  .av-spikes { display: flex; gap: 8px; flex-wrap: wrap; }
  .av-spike {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: 999px;
    font-family: var(--mono); font-size: 11px;
    letter-spacing: .04em;
    border: 1px solid;
    animation: av-pulse 2s ease-in-out infinite;
  }
  .av-spike-up {
    background: color-mix(in oklab, var(--accent) 10%, var(--bg));
    border-color: color-mix(in oklab, var(--accent) 30%, var(--line));
    color: var(--accent);
  }
  .av-spike-down {
    background: color-mix(in oklab, #e0432c 10%, var(--bg));
    border-color: color-mix(in oklab, #e0432c 30%, var(--line));
    color: #e0432c;
  }
  .av-spike-icon { font-size: 14px; }
  @keyframes av-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.6; }
  }

  /* Overview stats */
  .av-overview {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .av-stat .av-stat-l {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
  }
  .av-stat .av-stat-v {
    font-family: var(--serif); font-size: 32px;
    margin-top: 6px; color: var(--ink);
    display: inline-flex; align-items: baseline; gap: 4px;
  }
  .av-stat .av-stat-suf {
    font-family: var(--mono); font-size: 14px; color: var(--muted);
  }
  .av-stat.warn .av-stat-v { color: #e0432c; }

  /* Trends */
  .av-trends {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .av-trend-head {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 8px;
  }
  .av-trend-title {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
  }
  .av-trend-total {
    font-family: var(--serif); font-size: 20px; color: var(--ink);
  }

  /* Top lists */
  .av-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .av-card-title {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
    margin-bottom: 12px;
  }
  .av-empty {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    padding: 4px 0;
  }
  .av-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 60px 30px;
    align-items: center; gap: 8px;
    padding: 4px 0;
    font-size: 12.5px;
  }
  .av-row-name {
    display: flex; align-items: center; gap: 6px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .av-mono { font-family: var(--mono); font-size: 11.5px; }
  .av-flag { font-size: 14px; }
  .av-row-bar {
    height: 4px; background: var(--bg-deep); border-radius: 999px;
    overflow: hidden;
  }
  .av-row-fill {
    height: 100%; background: var(--accent);
    transition: width .6s ease-out;
  }
  .av-row-count {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-align: right;
  }

  /* Channel mix */
  .av-channel {
    border: 1px solid var(--line); border-radius: 10px;
    padding: 18px 20px; background: var(--bg);
  }
  .av-channel-bar {
    display: flex; height: 30px; border-radius: 6px; overflow: hidden;
    border: 1px solid var(--line);
  }
  .av-channel-seg {
    display: flex; align-items: center; justify-content: center;
    min-width: 80px;
  }
  .av-channel-lbl {
    font-family: var(--mono); font-size: 11px; color: var(--bg);
    text-transform: uppercase; letter-spacing: .14em;
  }

  /* API health */
  .av-api {
    border: 1px solid var(--line); border-radius: 10px;
    padding: 18px 20px; background: var(--bg);
  }
  .av-api-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
    margin-bottom: 18px;
  }
  .av-api-l {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
  }
  .av-api-v {
    font-family: var(--serif); font-size: 28px;
    color: var(--ink); margin-top: 6px;
  }
  .av-api-v.ok   { color: #2a9b6f; }
  .av-api-v.warn { color: #f0a000; }
  .av-api-v.bad  { color: #e0432c; }
  .av-api-suf { font-family: var(--mono); font-size: 14px; color: var(--muted); margin-left: 2px; }
  .av-api-recent {
    border-top: 1px solid var(--line);
    padding-top: 12px;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
  }
  .av-api-recent summary { cursor: pointer; user-select: none; }
  .av-api-row {
    display: grid;
    grid-template-columns: 110px 50px 180px 1fr;
    gap: 12px; padding: 4px 0;
    font-family: var(--mono); font-size: 11px;
    color: var(--ink-2);
  }
  .av-api-status { color: #e0432c; font-weight: 500; }
  .av-api-msg { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  @media (max-width: 1200px) {
    .av-overview, .av-trends, .av-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 600px) {
    .av-overview, .av-trends, .av-grid { grid-template-columns: 1fr; }
    .av-api-stats { grid-template-columns: 1fr; gap: 16px; }
    .av-api-row { grid-template-columns: 1fr; gap: 2px; }
  }
`;

export default AnalyticsView;
