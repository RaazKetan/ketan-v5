import React from "react";
import { DesignLayout, GridBg, Word } from "@/components/design";
import { RouteSEO } from "@/components/seo/RouteSEO";
import { usePersonalData } from "@/context/PersonalDataContext";

/* What gets stored when you browse the site.
   Plain-language, no legalese.

   The chat and voice agent were removed, so the section describing
   stored conversations went with them: a privacy policy claiming to
   collect messages that can no longer be sent is worse than no policy. */
export const Privacy: React.FC = () => {
  const { contactInfo } = usePersonalData();

  return (
    <DesignLayout>
      <RouteSEO
        title="Privacy - Ketan Raj"
        description="What data is collected when you browse Ketan Raj's site."
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
          Plain language. No legalese. If you browse the site, here is
          exactly what lands on a server I control.
        </p>

        <div className="pr-section">
          <h2>Site analytics</h2>
          <p>
            Page views and Core Web Vitals are recorded by Vercel Web
            Analytics. No cookies. No personal data inferred. Vercel's
            dashboard shows me aggregate country / device / browser
            counts and the events I added (button clicks, scroll depth,
            section visibility, route navigations).
          </p>
          <p>
            Page views are also written to a Postgres database I control,
            with: a random visitor ID (localStorage) and session ID
            (sessionStorage), your IP address and a daily-rotating hash of
            it, country / region / city / timezone derived from that IP by
            Vercel, User-Agent, top Accept-Language, screen size, referrer
            and a timestamp.
          </p>
        </div>

        <div className="pr-section">
          <h2>Why</h2>
          <p>
            So I can understand what people read, where they came from,
            and whether the site is fast enough. Pure
            curiosity + iteration signal. No ad networks, no third-party
            sharing.
          </p>
        </div>

        <div className="pr-section">
          <h2>How to opt out</h2>
          <p>
            Page views can be blocked with any standard tracker blocker
            (uBlock Origin etc.).
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
