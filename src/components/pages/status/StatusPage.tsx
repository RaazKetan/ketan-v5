import React from "react";
import { DesignLayout, GridBg, Btn, Word, Marquee } from "../../design";
import { RouteSEO } from "../../seo/RouteSEO";

export type StatusAction = {
  label: string;
  to?: string;       // internal router link
  href?: string;     // external / mailto
  onClick?: () => void;
  primary?: boolean;
};

export type StatusPageProps = {
  /* HTTP-style code shown big. Drives the visual: "404", "500", etc. */
  code: string;
  /* mono eyebrow text above the code. */
  eyebrow: string;
  /* h1 chunks. The em chunk is colored + italic. */
  titleHead: string;
  titleEm: string;
  titleTail: string;
  /* paragraph body. */
  body: string;
  /* marquee strip beneath body — set to [] to hide. */
  strip?: string[];
  /* CTAs. First is rendered primary by default unless overridden. */
  actions: StatusAction[];
  /* SEO title + description + whether to noindex (default true for status pages). */
  seoTitle: string;
  seoDescription?: string;
  noIndex?: boolean;
};

/* Shared display surface for non-content pages — 404, error, maintenance.
   Re-uses DesignLayout + the site's serif/mono/GridBg tokens so any
   off-the-happy-path page still feels like the same site. */
export const StatusPage: React.FC<StatusPageProps> = ({
  code,
  eyebrow,
  titleHead,
  titleEm,
  titleTail,
  body,
  strip = [],
  actions,
  seoTitle,
  seoDescription,
  noIndex = true,
}) => {
  return (
    <DesignLayout>
      <RouteSEO title={seoTitle} description={seoDescription} noIndex={noIndex} />
      <section className="st-hero">
        <div className="st-bg" aria-hidden>
          <GridBg count={3} />
        </div>

        <div className="st-eyebrow">
          <span className="st-led" />
          <span>{eyebrow}</span>
        </div>

        <div className="st-code" aria-hidden>{code}</div>

        <h1 className="st-h1">
          <Word>{titleHead}</Word> <Word em>{titleEm}</Word> <Word>{titleTail}</Word>
        </h1>

        <p className="st-sub">{body}</p>

        <div className="st-actions">
          {actions.map((a, i) => {
            const isPrimary = a.primary ?? i === 0;
            if (a.to) return <Btn key={a.label} to={a.to} primary={isPrimary}>{a.label}</Btn>;
            if (a.href) return <Btn key={a.label} href={a.href} primary={isPrimary} external>{a.label}</Btn>;
            return (
              <Btn key={a.label} primary={isPrimary} onClick={a.onClick}>{a.label}</Btn>
            );
          })}
        </div>

        {strip.length > 0 && (
          <div className="st-strip" aria-hidden>
            <Marquee items={strip} />
          </div>
        )}
      </section>

      <style>{`
        .st-hero {
          position: relative;
          min-height: calc(100vh - 200px);
          padding: 140px 56px 80px;
          max-width: var(--maxw);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          align-content: center;
          row-gap: 18px;
          overflow: hidden;
        }
        .st-bg {
          position: absolute; inset: 0; opacity: .35; pointer-events: none;
        }
        .st-eyebrow {
          position: relative;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--mono); font-size: 11px;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--muted);
        }
        .st-led {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 18%, transparent);
          animation: st-pulse 2s ease-in-out infinite;
        }
        @keyframes st-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }

        .st-code {
          position: relative;
          font-family: var(--serif);
          font-style: italic;
          font-weight: 400;
          font-size: clamp(140px, 28vw, 360px);
          line-height: 0.85;
          letter-spacing: -0.04em;
          color: var(--ink);
          margin: 8px 0 -16px;
          background:
            linear-gradient(180deg,
              color-mix(in oklab, var(--ink) 92%, transparent) 0%,
              color-mix(in oklab, var(--ink) 40%, transparent) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          user-select: none;
        }

        .st-h1 {
          position: relative;
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(40px, 7vw, 96px);
          line-height: 0.98;
          letter-spacing: -0.025em;
          margin: 0;
          max-width: 22ch;
        }
        .st-h1 em { font-style: italic; color: var(--accent); }

        .st-sub {
          position: relative;
          font-size: 16px; line-height: 1.6;
          color: var(--ink-2);
          max-width: 56ch;
          margin: 4px 0 0;
        }

        .st-actions {
          position: relative;
          display: flex; gap: 14px; flex-wrap: wrap;
          margin-top: 14px;
        }
        .st-actions a, .st-actions button { text-decoration: none; }

        .st-strip {
          position: relative;
          margin-top: 36px;
          border-top: 1px solid var(--line);
          padding-top: 18px;
          opacity: 0.7;
        }

        @media (max-width: 900px) {
          .st-hero { padding: 110px 24px 60px; row-gap: 14px; }
          .st-code { font-size: clamp(120px, 38vw, 240px); margin: 4px 0 -8px; }
        }
        @media (max-width: 560px) {
          .st-actions { gap: 10px; }
          .st-actions a, .st-actions button { width: 100%; justify-content: center; }
        }
      `}</style>
    </DesignLayout>
  );
};

export default StatusPage;
