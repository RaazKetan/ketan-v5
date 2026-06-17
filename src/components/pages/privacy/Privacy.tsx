import React from "react";
import { DesignLayout, GridBg, Word } from "@/components/design";
import { RouteSEO } from "@/components/seo/RouteSEO";
import { usePersonalData } from "@/context/PersonalDataContext";

/* What gets stored when you chat with the agent.
   Plain-language, no legalese. The intent is full disclosure so
   visitors can make an informed call about whether to use the agent. */
export const Privacy: React.FC = () => {
  const { contactInfo } = usePersonalData();

  return (
    <DesignLayout>
      <RouteSEO
        title="Privacy - Ketan Raj"
        description="What data is collected when you talk to Ketan's portfolio agent."
        path="/privacy"
      />
      <section className="pr-hero">
        <div className="pr-bg" aria-hidden>
          <GridBg count={2} />
        </div>

        <div className="pr-eyebrow">06 / Privacy</div>
        <h1 className="pr-h1">
          <Word>What</Word> <Word em>I</Word> <Word>collect.</Word>
        </h1>
        <p className="pr-sub">
          Plain language. No legalese. If you talk to the agent or browse
          the site, here is exactly what lands on a server I control.
        </p>

        <div className="pr-section">
          <h2>Agent conversations</h2>
          <p>
            Every message you send to the chat or voice agent is stored
            in a Postgres database, along with these signals:
          </p>
          <ul>
            <li>The text of your message and the agent's reply.</li>
            <li>A random visitor ID stored in your browser's localStorage.</li>
            <li>A random session ID stored in your browser's sessionStorage.</li>
            <li>Your IP address (raw + a daily-rotating hash).</li>
            <li>Country, region, city, and timezone derived from your IP by Vercel.</li>
            <li>User-Agent string (browser, OS, device).</li>
            <li>Top language from your Accept-Language header.</li>
            <li>Screen size, device pixel ratio, document.referrer.</li>
            <li>Timestamp of every message and session.</li>
          </ul>
        </div>

        <div className="pr-section">
          <h2>Site analytics</h2>
          <p>
            Page views and Core Web Vitals are recorded by Vercel Web
            Analytics. No cookies. No personal data inferred. Vercel's
            dashboard shows me aggregate country / device / browser
            counts and the events I added (button clicks, scroll depth,
            section visibility, route navigations).
          </p>
        </div>

        <div className="pr-section">
          <h2>Why</h2>
          <p>
            So I can understand what people ask, what they read, where
            they came from, and whether the site is fast enough. Pure
            curiosity + iteration signal. No ad networks, no third-party
            sharing.
          </p>
        </div>

        <div className="pr-section">
          <h2>How to opt out</h2>
          <p>
            Don't use the chat / voice agent. Pageviews can be blocked
            with any standard tracker blocker (uBlock Origin etc.).
            Email me at{" "}
            <a className="pr-link" href={`mailto:${contactInfo.email}`}>
              {contactInfo.email}
            </a>{" "}
            with your visitor ID (find it in DevTools → Application →
            Local Storage → <code>kr_visitor</code>) and I'll delete
            every row tied to you.
          </p>
        </div>
      </section>

      <style>{`
        .pr-hero {
          position: relative;
          padding: 140px 56px 100px;
          max-width: 780px;
          margin: 0 auto;
          display: flex; flex-direction: column; gap: 22px;
          overflow: hidden;
        }
        .pr-bg { position: absolute; inset: 0; opacity: .25; pointer-events: none; }
        .pr-eyebrow {
          position: relative;
          font-family: var(--mono); font-size: 11px;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--muted);
        }
        .pr-h1 {
          position: relative;
          font-family: var(--serif); font-weight: 400;
          font-size: clamp(48px, 8vw, 96px);
          line-height: 0.98; letter-spacing: -0.025em;
          margin: 0;
        }
        .pr-h1 em { font-style: italic; color: var(--accent); }
        .pr-sub {
          position: relative;
          font-size: 16px; line-height: 1.6; color: var(--ink-2);
          max-width: 56ch; margin: 0;
        }
        .pr-section {
          position: relative;
          padding-top: 22px; border-top: 1px solid var(--line);
        }
        .pr-section h2 {
          font-family: var(--serif); font-weight: 400;
          font-size: 22px; margin: 0 0 10px;
        }
        .pr-section p {
          font-size: 14px; line-height: 1.7; color: var(--ink-2); margin: 0 0 10px;
        }
        .pr-section ul {
          margin: 6px 0 0 0; padding-left: 18px;
          color: var(--ink-2); font-size: 14px; line-height: 1.7;
        }
        .pr-section code {
          font-family: var(--mono); font-size: 12px;
          background: var(--bg-deep); padding: 1px 6px; border-radius: 4px;
        }
        .pr-link {
          color: var(--accent); text-decoration: none;
          border-bottom: 1px solid currentColor;
        }
        .pr-link:hover { color: var(--ink); }
        @media (max-width: 700px) {
          .pr-hero { padding: 110px 22px 70px; }
        }
      `}</style>
    </DesignLayout>
  );
};

export default Privacy;
