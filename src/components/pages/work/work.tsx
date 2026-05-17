import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DesignLayout,
  GridBg,
  Chip,
  Btn,
  ShimmerBtn,
  NumberTicker,
  Word,
} from "../../design";
import { useDesignAnimations } from "../../../Hooks/useDesignAnimations";
import { ARCHIVE } from "../../../data/projects";

gsap.registerPlugin(ScrollTrigger);

const ROWS = ARCHIVE.map((p, i) => ({
  ...p,
  num: String(i + 1).padStart(2, "0"),
  href: p.live || p.repo,
}));

export const Work: React.FC = () => {
  useDesignAnimations();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.05, defaults: { ease: "power3.out" } });
      tl.from(".ds-nav", { autoAlpha: 0, y: -16, duration: 0.8 }, 0)
        .from(".w-label", { autoAlpha: 0, y: 18, duration: 0.8 }, 0.15)
        .from(".w-hero h1 .word > span", { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0.25)
        .from(".w-lede > *", { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.9);

      gsap.from(".w-stats .stat", {
        y: 20,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".w-stats", start: "top 90%" },
      });

      gsap.from(".w-row", {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.04,
        ease: "power3.out",
        scrollTrigger: { trigger: ".w-archive", start: "top 80%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <DesignLayout>
      <section className="w-hero">
        <div className="w-hero-bg">
          <GridBg count={3} />
        </div>
        <div>
          <div className="w-label">03 / Work · archive</div>
          <h1 data-split>
            <Word>Five</Word> <Word em>years</Word> <Word>of</Word>{" "}
            <Word>shipping.</Word>
          </h1>
          <div className="w-lede">
            <div className="l">Selected · 2021 — 2026</div>
            <div className="r">
              Things I've made, broken, fixed, deleted and shipped — across
              agents, full-stack apps, dev tooling, and the thin glass between
              people and machines.
            </div>
          </div>
        </div>
      </section>

      <div className="w-stats">
        <div className="stat">
          <div className="num">
            <NumberTicker value={5} />
            <span className="suffix">yrs</span>
          </div>
          <div className="lbl">Years shipping software</div>
        </div>
        <div className="stat">
          <div className="num">
            <NumberTicker value={70} />
            <span className="suffix">+</span>
          </div>
          <div className="lbl">Public repos on GitHub</div>
        </div>
        <div className="stat">
          <div className="num">
            <NumberTicker value={ARCHIVE.length} />
            <span className="suffix">·</span>
          </div>
          <div className="lbl">Selected projects in the archive</div>
        </div>
        <div className="stat">
          <div className="num">
            <NumberTicker value={6} />
            <span className="suffix">×</span>
          </div>
          <div className="lbl">Deep case studies</div>
        </div>
      </div>

      <section className="w-archive">
        <div className="row-head">
          <div>№</div>
          <div>Project</div>
          <div>Role</div>
          <div>Stack</div>
          <div>Year</div>
        </div>

        {ROWS.map((r) => (
          <a
            key={r.slug}
            className="w-row"
            href={r.href}
            target="_blank"
            rel="noreferrer"
            data-magnet="0.05"
          >
            <div className="idx">{r.num}</div>
            <div className="pname">
              {r.name}, <em>{r.short.split(".")[0].toLowerCase()}</em>
              <span className="desc">{r.short}</span>
            </div>
            <div className="role">{r.role.split("·")[0].trim()}</div>
            <div className="tags">
              {r.tech.slice(0, 3).map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
            <div className="year">{r.year}</div>
          </a>
        ))}
      </section>

      <section className="w-cta">
        <div className="w-cta-bg">
          <GridBg count={3} />
        </div>
        <h2>
          <Word>Currently</Word> <Word em>booking</Word>{" "}
          <Word>Q3.</Word>
        </h2>
        <div className="w-cta-actions">
          <ShimmerBtn to="/contact">Start a project ↗</ShimmerBtn>
          <Btn to="/about">
            <span>About me</span>
            <span>→</span>
          </Btn>
        </div>
      </section>

      <style>{styles}</style>
    </DesignLayout>
  );
};

const styles = `
  .w-hero {
    min-height: 80vh; padding: 160px 56px 80px; position: relative;
    max-width: var(--maxw); margin: 0 auto;
    display: grid; align-items: end;
  }
  .w-hero-bg { position: absolute; inset: 0; opacity: .6; }
  .w-label {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; margin-bottom: 32px;
    display: flex; align-items: center; gap: 12px;
  }
  .w-label::before { content: ""; width: 32px; height: 1px; background: var(--ink); }
  .w-hero h1 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(72px, 14vw, 220px);
    line-height: 0.86; letter-spacing: -0.02em;
  }
  .w-hero h1 em { font-style: italic; color: var(--accent); }
  .w-lede {
    margin-top: 40px;
    display: grid; grid-template-columns: 1fr 2fr; gap: 48px;
    border-top: 1px solid var(--line); padding-top: 32px;
  }
  .w-lede .l {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
  }
  .w-lede .r {
    font-family: var(--serif); font-style: italic;
    font-size: 22px; line-height: 1.4; color: var(--ink-2); max-width: 56ch;
  }

  .w-stats {
    margin: 0 auto 96px; max-width: var(--maxw);
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
    border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
    padding: 40px 56px;
  }
  .stat .num {
    font-family: var(--serif); font-size: clamp(48px, 5vw, 80px);
    line-height: 0.9; letter-spacing: -0.02em;
    display: flex; align-items: baseline; gap: 4px;
  }
  .stat .num .suffix { font-size: 0.45em; color: var(--accent); }
  .stat .lbl {
    margin-top: 12px;
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
    max-width: 22ch;
  }

  .w-archive { padding: 0 56px 160px; max-width: var(--maxw); margin: 0 auto; }
  .row-head {
    display: grid; grid-template-columns: 60px 1.5fr 1fr 1fr 80px;
    gap: 32px; padding: 16px 0; border-bottom: 1px solid var(--ink);
    font-family: var(--mono); font-size: 10px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--muted);
  }
  .w-row {
    display: grid; grid-template-columns: 60px 1.5fr 1fr 1fr 80px;
    gap: 32px; padding: 32px 0; border-bottom: 1px solid var(--line);
    align-items: baseline; position: relative;
    transition: padding .4s var(--ease);
  }
  .w-row::after {
    content: ""; position: absolute; left: 0; bottom: -1px; height: 1px;
    width: 0; background: var(--accent); transition: width .6s var(--ease);
  }
  .w-row:hover { padding-left: 12px; }
  .w-row:hover::after { width: 100%; }
  .w-row:hover .pname,
  .w-row:hover .pname em { color: var(--accent); }

  .w-row .idx { font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .w-row .pname {
    font-family: var(--serif); font-size: 32px; line-height: 1.05;
    letter-spacing: -0.01em; transition: color .3s;
  }
  .w-row .pname em { font-style: italic; color: var(--accent); transition: color .3s; }
  .w-row .pname .desc {
    display: block; margin-top: 8px;
    font-family: var(--sans); font-style: normal;
    font-size: 14px; line-height: 1.6; color: var(--ink-2); max-width: 56ch;
  }
  .w-row .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .w-row .role {
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--ink-2);
  }
  .w-row .year {
    font-family: var(--mono); font-size: 12px;
    text-align: right; color: var(--muted);
  }

  .w-cta {
    margin-top: 80px; padding: 96px 56px;
    border-top: 1px solid var(--line); position: relative; overflow: hidden;
    max-width: var(--maxw); margin-left: auto; margin-right: auto;
  }
  .w-cta-bg { position: absolute; inset: 0; opacity: .5; }
  .w-cta h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 8vw, 140px); line-height: 0.92; letter-spacing: -0.03em;
    text-align: center; position: relative;
  }
  .w-cta h2 em { font-style: italic; color: var(--accent); }
  .w-cta-actions {
    margin-top: 48px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    position: relative;
  }

  @media (max-width: 1100px) {
    .w-hero h1 { font-size: clamp(56px, 12vw, 140px); }
  }
  @media (max-width: 900px) {
    .w-hero { padding: 130px 24px 60px; }
    .w-hero h1 { font-size: clamp(48px, 11vw, 96px); }
    .w-archive { padding: 0 24px 80px; }
    .row-head, .w-row { grid-template-columns: 40px 1fr; gap: 16px; padding: 20px 0; }
    .row-head > *:nth-child(n+3),
    .w-row > *:nth-child(n+3) { display: none; }
    .w-row .pname { font-size: 22px; }
    .w-stats {
      grid-template-columns: 1fr 1fr;
      padding: 28px 20px;
      margin: 0 24px 60px;
      gap: 16px;
    }
    .stat .num { font-size: clamp(36px, 9vw, 56px); }
    .w-lede { grid-template-columns: 1fr; gap: 16px; }
    .w-lede .r { font-size: 18px; }
    .w-cta { padding: 64px 24px; }
    .w-cta h2 { font-size: clamp(36px, 10vw, 72px); }
  }
  @media (max-width: 600px) {
    .w-hero { padding: 140px 18px 40px; }
    .w-hero h1 { font-size: clamp(42px, 11vw, 72px); }
    .w-archive { padding: 0 18px 60px; }
    .w-stats { padding: 22px 16px; margin: 0 18px 50px; }
    .w-row { padding: 18px 0; }
    .w-row .pname { font-size: 20px; }
    .w-cta { padding: 56px 18px; }
  }
`;
