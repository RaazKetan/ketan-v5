import React from "react";
import { DesignLayout, GridBg, Btn, Word } from "../../design";
import { RouteSEO } from "../../seo/RouteSEO";

export const NotFound: React.FC = () => {
  return (
    <DesignLayout>
      <RouteSEO
        title="404 - Page not found | Ketan Raj"
        description="The page you're looking for doesn't exist on Ketan Raj's portfolio."
        noIndex
      />
      <section className="nf-hero">
        <div className="nf-bg">
          <GridBg count={2} />
        </div>
        <div className="nf-eyebrow">404 / Lost in the stack</div>
        <h1 className="nf-h1">
          <Word>This</Word> <Word em>page</Word> <Word>got</Word> <Word>away.</Word>
        </h1>
        <p className="nf-sub">
          Either the URL was mistyped, the link is stale, or this page never
          existed. Either way - here are a few places that do.
        </p>
        <div className="nf-actions">
          <Btn to="/" primary>Back to home</Btn>
          <Btn to="/projects">See projects</Btn>
          <Btn to="/contact">Say hi</Btn>
        </div>
      </section>

      <style>{`
        .nf-hero {
          position: relative;
          min-height: calc(100vh - 200px);
          padding: 160px 56px 100px;
          max-width: var(--maxw);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 22px;
          overflow: hidden;
        }
        .nf-bg {
          position: absolute; inset: 0; opacity: .5; pointer-events: none;
        }
        .nf-eyebrow {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--muted);
          position: relative;
        }
        .nf-h1 {
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(56px, 12vw, 160px);
          line-height: 0.92;
          letter-spacing: -0.03em;
          margin: 0;
          position: relative;
        }
        .nf-h1 em { font-style: italic; color: var(--accent); }
        .nf-sub {
          font-size: 16px;
          line-height: 1.6;
          color: var(--ink-2);
          max-width: 540px;
          margin: 0;
          position: relative;
        }
        .nf-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 18px;
          position: relative;
        }
        .nf-actions a { text-decoration: none; color: inherit; }
        @media (max-width: 900px) {
          .nf-hero { padding: 120px 24px 80px; }
        }
      `}</style>
    </DesignLayout>
  );
};

export default NotFound;
