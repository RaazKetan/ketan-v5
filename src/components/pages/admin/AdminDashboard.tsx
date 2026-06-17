import React, { useEffect, useState } from "react";
import { DesignLayout, GridBg, Word } from "@/components/design";
import { RouteSEO } from "@/components/seo/RouteSEO";

type Stats = {
  range: string;
  since: string;
  sessionCount: number;
  messageCount: number;
  uniqueVisitors: number;
  topCountries: Array<{ name: string; count: number }>;
  topCities: Array<{ name: string; count: number }>;
  topBrowsers: Array<{ name: string; count: number }>;
  topOS: Array<{ name: string; count: number }>;
  channelMix: Record<string, number>;
  dailySeries: Array<{ date: string; count: number }>;
};

type ConvRow = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  channel: string | null;
  pagePath: string | null;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  messageCount: number;
  lastMessage: string | null;
};

type SessionDetail = {
  session: Record<string, unknown> & {
    id: string;
    started_at: string;
    ended_at: string | null;
    channel: string | null;
    visitors: Record<string, unknown> | null;
  };
  messages: Array<{
    id: number;
    role: "user" | "agent";
    source: "text" | "voice";
    text: string;
    ts: string;
  }>;
};

type Range = "24h" | "7d" | "30d";

type Props = { onLogout: () => void };

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [range, setRange] = useState<Range>("7d");
  const [stats, setStats] = useState<Stats | null>(null);
  const [conversations, setConversations] = useState<ConvRow[] | null>(null);
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, convRes] = await Promise.all([
          fetch(`/api/admin/stats?range=${range}`).then((r) => r.json()),
          fetch(`/api/admin/conversations?limit=50`).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setStats(statsRes);
        setConversations(convRes.rows || []);
      } catch (e) {
        console.error("[admin] load", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  useEffect(() => {
    if (!openSessionId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/session?id=${encodeURIComponent(openSessionId)}`
        ).then((r) => r.json());
        if (!cancelled) setDetail(res);
      } catch (e) {
        console.error("[admin] session detail", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [openSessionId]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    onLogout();
  };

  return (
    <DesignLayout>
      <RouteSEO title="Admin · dashboard" noIndex />
      <section className="ad-hero">
        <div className="ad-bg" aria-hidden>
          <GridBg count={2} />
        </div>

        <div className="ad-top">
          <div>
            <div className="ad-eyebrow">Admin / live</div>
            <h1 className="ad-h1">
              <Word>What</Word> <Word em>people</Word> <Word>ask.</Word>
            </h1>
          </div>
          <div className="ad-controls">
            <div className="ad-range">
              {(["24h", "7d", "30d"] as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`ad-pill${range === r ? " is-active" : ""}`}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <button className="ad-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {loading && !stats && <div className="ad-loading">Loading…</div>}

        {stats && (
          <div className="ad-stats">
            <Stat label="Sessions" value={stats.sessionCount} />
            <Stat label="Messages" value={stats.messageCount} />
            <Stat label="Unique visitors" value={stats.uniqueVisitors} />
            <Stat
              label="Channels"
              value={Object.entries(stats.channelMix)
                .map(([k, v]) => `${k}:${v}`)
                .join(" · ") || "-"}
            />
          </div>
        )}

        {stats && (
          <div className="ad-grids">
            <TopList title="Top countries" items={stats.topCountries} />
            <TopList title="Top cities" items={stats.topCities} />
            <TopList title="Browsers" items={stats.topBrowsers} />
            <TopList title="Operating systems" items={stats.topOS} />
          </div>
        )}

        <div className="ad-section">
          <div className="ad-sec-head">Recent conversations</div>
          <div className="ad-table">
            <div className="ad-row ad-head">
              <span>When</span>
              <span>Where</span>
              <span>Channel</span>
              <span>Msgs</span>
              <span>Preview</span>
            </div>
            {(conversations || []).map((c) => (
              <button
                key={c.id}
                className="ad-row ad-clickable"
                onClick={() => setOpenSessionId(c.id)}
              >
                <span>{new Date(c.startedAt).toLocaleString()}</span>
                <span>
                  {[c.city, c.country].filter(Boolean).join(", ") || "-"}
                  <span className="ad-sub">
                    {" "}
                    {c.browser}/{c.os}/{c.device}
                  </span>
                </span>
                <span>{c.channel || "-"}</span>
                <span>{c.messageCount}</span>
                <span className="ad-preview">{c.lastMessage || "(empty)"}</span>
              </button>
            ))}
            {conversations && conversations.length === 0 && (
              <div className="ad-empty">
                No conversations yet. Open the chat on the site and say hi.
              </div>
            )}
          </div>
        </div>
      </section>

      {openSessionId && detail && (
        <SessionDrawer
          detail={detail}
          onClose={() => setOpenSessionId(null)}
        />
      )}

      <style>{styles}</style>
    </DesignLayout>
  );
};

const Stat: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div className="ad-stat">
    <div className="ad-stat-l">{label}</div>
    <div className="ad-stat-v">{value}</div>
  </div>
);

const TopList: React.FC<{
  title: string;
  items: Array<{ name: string; count: number }>;
}> = ({ title, items }) => (
  <div className="ad-card">
    <div className="ad-card-title">{title}</div>
    <ul>
      {items.length === 0 && <li className="ad-empty-inline">No data yet</li>}
      {items.map((i) => (
        <li key={i.name}>
          <span>{i.name}</span>
          <span className="ad-count">{i.count}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SessionDrawer: React.FC<{
  detail: SessionDetail;
  onClose: () => void;
}> = ({ detail, onClose }) => {
  const v = (detail.session.visitors || {}) as Record<string, unknown>;
  return (
    <div className="ad-drawer" role="dialog" aria-label="Session detail">
      <div className="ad-drawer-bg" onClick={onClose} />
      <div className="ad-drawer-panel">
        <button className="ad-drawer-close" onClick={onClose}>
          ✕
        </button>
        <div className="ad-drawer-head">
          <div className="ad-eyebrow">Session</div>
          <div className="ad-drawer-id">{detail.session.id}</div>
          <div className="ad-drawer-meta">
            {[
              v.city,
              v.country,
              v.region,
              v.timezone,
              v.ua_browser,
              v.ua_os,
              v.ua_device,
              v.language,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
          <div className="ad-drawer-meta">
            Started {new Date(detail.session.started_at).toLocaleString()}
            {detail.session.ended_at &&
              ` · ended ${new Date(detail.session.ended_at).toLocaleString()}`}
          </div>
        </div>
        <div className="ad-msgs">
          {detail.messages.map((m) => (
            <div key={m.id} className={`ad-msg ad-msg-${m.role}`}>
              <div className="ad-msg-meta">
                <span>{m.role}</span>
                <span>·</span>
                <span>{m.source}</span>
                <span>·</span>
                <span>{new Date(m.ts).toLocaleTimeString()}</span>
              </div>
              <div className="ad-msg-text">{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = `
  .ad-hero {
    position: relative;
    min-height: 100vh;
    padding: 120px 56px 80px;
    max-width: var(--maxw);
    margin: 0 auto;
    display: grid; row-gap: 36px;
    overflow: hidden;
  }
  .ad-bg { position: absolute; inset: 0; opacity: .25; pointer-events: none; }
  .ad-top {
    position: relative;
    display: flex; justify-content: space-between; align-items: flex-end;
    flex-wrap: wrap; gap: 18px;
  }
  .ad-eyebrow {
    font-family: var(--mono); font-size: 11px;
    letter-spacing: .18em; text-transform: uppercase; color: var(--muted);
  }
  .ad-h1 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 7vw, 88px);
    line-height: 0.95; letter-spacing: -0.025em; margin: 6px 0 0;
  }
  .ad-h1 em { font-style: italic; color: var(--accent); }
  .ad-controls { display: flex; align-items: center; gap: 12px; }
  .ad-range { display: flex; gap: 6px; }
  .ad-pill {
    padding: 6px 12px; border-radius: 999px;
    border: 1px solid var(--line); background: transparent;
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em;
    cursor: pointer; color: var(--ink-2);
    transition: border-color .25s, color .25s, background .25s;
  }
  .ad-pill:hover { border-color: var(--ink); color: var(--ink); }
  .ad-pill.is-active { background: var(--ink); color: var(--bg); border-color: var(--ink); }
  .ad-logout {
    padding: 6px 12px; border-radius: 999px;
    border: 1px solid var(--line); background: transparent;
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em;
    cursor: pointer; color: var(--ink-2);
  }

  .ad-loading {
    position: relative;
    font-family: var(--mono); font-size: 12px; color: var(--muted);
  }

  .ad-stats {
    position: relative;
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .ad-stat {
    border: 1px solid var(--line); border-radius: 8px;
    padding: 16px 18px; background: var(--bg);
  }
  .ad-stat-l {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
  }
  .ad-stat-v {
    font-family: var(--serif); font-size: 28px;
    margin-top: 6px; color: var(--ink);
  }

  .ad-grids {
    position: relative;
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .ad-card {
    border: 1px solid var(--line); border-radius: 8px;
    padding: 16px 18px; background: var(--bg);
  }
  .ad-card-title {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
    margin-bottom: 10px;
  }
  .ad-card ul { list-style: none; padding: 0; margin: 0; }
  .ad-card li {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 6px 0; border-top: 1px solid var(--line);
    font-size: 13px;
  }
  .ad-card li:first-child { border-top: 0; }
  .ad-count { color: var(--muted); font-family: var(--mono); font-size: 11px; }
  .ad-empty-inline { color: var(--muted); font-size: 12px; padding: 4px 0; }

  .ad-section { position: relative; }
  .ad-sec-head {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
    margin-bottom: 10px;
  }
  .ad-table {
    border: 1px solid var(--line); border-radius: 8px;
    overflow: hidden; background: var(--bg);
  }
  .ad-row {
    display: grid;
    grid-template-columns: 180px 200px 70px 50px 1fr;
    gap: 14px;
    align-items: center;
    padding: 10px 14px;
    border-top: 1px solid var(--line);
    background: transparent;
    border-left: 0; border-right: 0; border-bottom: 0;
    text-align: left;
    font-size: 13px;
    color: var(--ink);
  }
  .ad-row:first-child { border-top: 0; }
  .ad-head {
    background: var(--bg-deep);
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em;
    color: var(--muted);
  }
  .ad-clickable { cursor: pointer; }
  .ad-clickable:hover { background: var(--bg-deep); }
  .ad-sub { color: var(--muted); font-size: 11px; }
  .ad-preview {
    color: var(--ink-2);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .ad-empty {
    padding: 24px; font-family: var(--mono); font-size: 12px;
    color: var(--muted);
  }

  /* Drawer */
  .ad-drawer { position: fixed; inset: 0; z-index: 200; }
  .ad-drawer-bg {
    position: absolute; inset: 0;
    background: rgba(22, 21, 19, 0.35); backdrop-filter: blur(2px);
  }
  .ad-drawer-panel {
    position: absolute; top: 0; right: 0; bottom: 0;
    width: min(720px, 92vw);
    background: var(--bg);
    border-left: 1px solid var(--line);
    display: flex; flex-direction: column;
    box-shadow: -20px 0 40px rgba(22, 21, 19, 0.12);
    animation: ad-slide .3s var(--ease);
  }
  @keyframes ad-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .ad-drawer-close {
    position: absolute; top: 14px; right: 14px;
    background: transparent; border: 1px solid var(--line);
    width: 32px; height: 32px; border-radius: 50%;
    cursor: pointer; color: var(--ink-2);
  }
  .ad-drawer-head {
    padding: 28px 28px 18px;
    border-bottom: 1px solid var(--line);
    display: flex; flex-direction: column; gap: 8px;
  }
  .ad-drawer-id {
    font-family: var(--mono); font-size: 11px; color: var(--ink);
  }
  .ad-drawer-meta {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    line-height: 1.5;
  }
  .ad-msgs {
    flex: 1; overflow-y: auto;
    padding: 18px 28px; display: flex; flex-direction: column; gap: 14px;
  }
  .ad-msg { display: flex; flex-direction: column; gap: 4px; }
  .ad-msg-user { align-self: flex-end; max-width: 80%; }
  .ad-msg-agent { align-self: flex-start; max-width: 80%; }
  .ad-msg-meta {
    font-family: var(--mono); font-size: 10px;
    color: var(--muted); display: flex; gap: 6px;
    text-transform: uppercase; letter-spacing: .12em;
  }
  .ad-msg-text {
    padding: 10px 14px; border-radius: 12px;
    font-size: 14px; line-height: 1.5;
    background: var(--bg-deep);
  }
  .ad-msg-user .ad-msg-text { background: var(--ink); color: var(--bg); }

  @media (max-width: 1000px) {
    .ad-stats, .ad-grids { grid-template-columns: repeat(2, 1fr); }
    .ad-row { grid-template-columns: 140px 1fr 50px 40px; }
    .ad-row > :nth-child(5) { display: none; }
  }
  @media (max-width: 600px) {
    .ad-hero { padding: 100px 18px 60px; }
    .ad-stats, .ad-grids { grid-template-columns: 1fr; }
    .ad-row { grid-template-columns: 1fr 50px 40px; gap: 8px; padding: 10px; }
    .ad-row > :nth-child(2) { display: none; }
    .ad-h1 { font-size: clamp(36px, 9vw, 64px); }
  }
`;

export default AdminDashboard;
