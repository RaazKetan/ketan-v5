import React, { useEffect, useState } from "react";
import { DesignLayout, GridBg, Word } from "@/components/design";
import { RouteSEO } from "@/components/seo/RouteSEO";
import { AnalyticsView } from "./AnalyticsView";

type ConvRow = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  channel: string | null;
  pagePath: string | null;
  visitorId: string | null;
  ip: string | null;
  ipHash: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  language: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  model: string | null;
  screenW: number | null;
  screenH: number | null;
  visitCount: number | null;
  referrer: string | null;
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
  visitorModel?: string | null;
};

type Range = "24h" | "7d" | "30d";

type Props = { onLogout: () => void };
type Tab = "overview" | "conversations";

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [tab, setTab] = useState<Tab>("overview");
  const [range, setRange] = useState<Range>("7d");
  const [conversations, setConversations] = useState<ConvRow[] | null>(null);
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  /* Centralized 401 handler — any admin endpoint that responds 401
     means our cookie has gone bad (HMAC rotated, expired, signed out
     elsewhere). Kick to the login screen instead of leaving the user
     staring at empty cards. */
  const handleUnauthorized = onLogout;

  useEffect(() => {
    if (tab !== "conversations") return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/admin/conversations?limit=50`, {
          credentials: "same-origin",
        });
        if (r.status === 401) {
          handleUnauthorized();
          return;
        }
        const convRes = await r.json();
        if (cancelled) return;
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
  }, [range, tab]);

  useEffect(() => {
    if (!openSessionId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/admin/session?id=${encodeURIComponent(openSessionId)}`,
          { credentials: "same-origin" }
        );
        if (r.status === 401) {
          handleUnauthorized();
          return;
        }
        const res = await r.json();
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
              <Word>What</Word> <Word em>people</Word> <Word>do.</Word>
            </h1>
            <div className="ad-tabs">
              {(["overview", "conversations"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`ad-tab${tab === t ? " is-active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t === "overview" ? "Overview" : "Conversations"}
                </button>
              ))}
            </div>
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

        {tab === "overview" && (
          <AnalyticsView range={range} onUnauthorized={handleUnauthorized} />
        )}

        {tab === "conversations" && (
        <div className="ad-section">
          <div className="ad-sec-head">Recent conversations</div>
          <div className="ad-table-scroll">
            <div className="ad-table ad-table-wide">
              <div className="ad-row ad-head">
                <span>When</span>
                <span>IP</span>
                <span>Where</span>
                <span>Device</span>
                <span>Browser / OS</span>
                <span>Channel</span>
                <span title="Messages count">Msgs</span>
                <span>Preview</span>
              </div>
              {(conversations || []).map((c) => (
                <button
                  key={c.id}
                  className="ad-row ad-clickable"
                  onClick={() => setOpenSessionId(c.id)}
                >
                  <span>
                    {new Date(c.startedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {c.timezone && (
                      <span className="ad-sub"> {c.timezone}</span>
                    )}
                  </span>
                  <span className="ad-mono">
                    {c.ip && c.ip !== "unknown" ? c.ip : "-"}
                  </span>
                  <span>
                    {[c.city, c.region, c.country].filter(Boolean).join(", ") ||
                      "-"}
                  </span>
                  <span>
                    {c.model || c.device || "-"}
                    {c.screenW && c.screenH && (
                      <span className="ad-sub">
                        {" "}
                        {c.screenW}×{c.screenH}
                      </span>
                    )}
                  </span>
                  <span>
                    {c.browser || "-"}
                    {c.os && <span className="ad-sub"> / {c.os}</span>}
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
        </div>
        )}

        {tab === "conversations" && loading && (
          <div className="ad-loading">Loading…</div>
        )}
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

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const KV: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}> = ({ label, value, mono, wrap }) => (
  <div className="ad-kv-row">
    <div className="ad-kv-l">{label}</div>
    <div
      className={`ad-kv-v${mono ? " ad-mono" : ""}${wrap ? " ad-wrap" : ""}`}
      title={value}
    >
      {value}
    </div>
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

          <div className="ad-kv">
            <KV label="Started" value={fmtDateTime(detail.session.started_at)} />
            <KV
              label="Ended"
              value={
                detail.session.ended_at
                  ? fmtDateTime(detail.session.ended_at)
                  : "(active)"
              }
            />
            <KV label="Channel" value={detail.session.channel || "-"} />
            <KV
              label="Page"
              value={(detail.session.page_path as string) || "-"}
            />
          </div>

          <div className="ad-drawer-divider">VISITOR</div>

          <div className="ad-kv">
            <KV label="IP" value={(v.ip as string) || "-"} mono />
            <KV
              label="IP hash"
              value={(v.ip_hash as string)?.slice(0, 16) + "…" || "-"}
              mono
            />
            <KV label="Country" value={(v.country as string) || "-"} />
            <KV label="Region" value={(v.region as string) || "-"} />
            <KV label="City" value={(v.city as string) || "-"} />
            <KV label="Timezone" value={(v.timezone as string) || "-"} />
            <KV
              label="Coords"
              value={
                v.latitude && v.longitude
                  ? `${v.latitude}, ${v.longitude}`
                  : "-"
              }
              mono
            />
            <KV label="Language" value={(v.language as string) || "-"} />
          </div>

          <div className="ad-kv">
            <KV
              label="Device"
              value={detail.visitorModel || (v.ua_device as string) || "-"}
            />
            <KV label="Browser" value={(v.ua_browser as string) || "-"} />
            <KV label="OS" value={(v.ua_os as string) || "-"} />
            <KV
              label="Screen"
              value={
                v.screen_w && v.screen_h
                  ? `${v.screen_w}×${v.screen_h} · ${v.dpr || 1}x`
                  : "-"
              }
            />
            <KV
              label="Visits"
              value={String((v.visit_count as number) ?? "-")}
            />
            <KV
              label="Referrer"
              value={(v.referrer as string) || "(direct)"}
              wrap
            />
          </div>

          <details className="ad-ua-details">
            <summary>Full User-Agent</summary>
            <code className="ad-ua-raw">{(v.ua as string) || "-"}</code>
          </details>
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

  .ad-tabs {
    display: inline-flex; gap: 4px;
    margin-top: 16px;
    padding: 4px;
    background: var(--bg-deep); border-radius: 999px;
    border: 1px solid var(--line);
  }
  .ad-tab {
    padding: 8px 18px; border-radius: 999px;
    border: 0; background: transparent;
    font-family: var(--mono); font-size: 11px;
    letter-spacing: .12em; text-transform: uppercase;
    cursor: pointer; color: var(--ink-2);
    transition: color .2s, background .2s;
  }
  .ad-tab:hover { color: var(--ink); }
  .ad-tab.is-active {
    background: var(--bg); color: var(--ink);
    box-shadow: 0 1px 3px rgba(22, 21, 19, 0.08);
  }

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

  .ad-section { position: relative; }
  .ad-sec-head {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
    margin-bottom: 10px;
  }
  /* Horizontal scroll wrapper so the wide table doesn't break the layout
     on narrow screens. The min-width lets every column breathe. */
  .ad-table-scroll {
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--bg);
    overflow-x: auto;
  }
  .ad-table { background: var(--bg); }
  .ad-table-wide { min-width: 1280px; }
  .ad-row {
    display: grid;
    grid-template-columns:
      140px              /* When */
      140px              /* IP */
      200px              /* Where */
      200px              /* Device */
      160px              /* Browser / OS */
      80px               /* Channel */
      60px               /* Msgs */
      minmax(220px, 1fr);/* Preview */
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
    position: sticky; top: 0; z-index: 1;
  }
  .ad-clickable { cursor: pointer; }
  .ad-clickable:hover { background: var(--bg-deep); }
  .ad-sub { color: var(--muted); font-size: 11px; }
  .ad-mono { font-family: var(--mono); font-size: 11.5px; }
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
  .ad-drawer-divider {
    margin-top: 14px; padding-top: 10px;
    border-top: 1px solid var(--line);
    font-family: var(--mono); font-size: 9px;
    letter-spacing: .2em; text-transform: uppercase;
    color: var(--muted);
  }
  .ad-kv {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 18px;
    margin-top: 8px;
  }
  .ad-kv-row { display: grid; grid-template-columns: 78px 1fr; gap: 8px; min-width: 0; }
  .ad-kv-l {
    font-family: var(--mono); font-size: 9.5px;
    letter-spacing: .14em; text-transform: uppercase;
    color: var(--muted); align-self: center;
  }
  .ad-kv-v {
    font-size: 12.5px; color: var(--ink);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .ad-kv-v.ad-wrap { white-space: normal; word-break: break-all; }
  .ad-ua-details {
    margin-top: 12px; padding-top: 10px;
    border-top: 1px solid var(--line);
    font-family: var(--mono); font-size: 11px; color: var(--muted);
  }
  .ad-ua-details summary { cursor: pointer; user-select: none; }
  .ad-ua-raw {
    display: block; margin-top: 8px;
    font-family: var(--mono); font-size: 10.5px;
    color: var(--ink-2); word-break: break-all; line-height: 1.5;
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
    .ad-kv { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .ad-hero { padding: 100px 18px 60px; }
    .ad-h1 { font-size: clamp(36px, 9vw, 64px); }
    .ad-kv-row { grid-template-columns: 70px 1fr; }
  }
`;

export default AdminDashboard;
