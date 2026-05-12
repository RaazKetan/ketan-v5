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

gsap.registerPlugin(ScrollTrigger);

type Row = {
  num: string;
  name: string;
  nameEm: string;
  desc: string;
  role: string;
  tags: string[];
  year: string;
  href?: string;
};

const ROWS: Row[] = [
  {
    num: "01",
    name: "Halcyon,",
    nameEm: "real-time analytics editor",
    desc: "Multiplayer SQL workspace · sub-50ms p99 query feedback · streaming layer + CRDT editor + type-aware completion.",
    role: "Staff Engineer",
    tags: ["Rust", "WASM", "TS"],
    year: "2024 →",
  },
  {
    num: "02",
    name: "Tessera,",
    nameEm: "type-driven design system",
    desc: "Token-first component library · 40-engineer org · single source of truth across four product surfaces.",
    role: "Founding Eng",
    tags: ["TS", "React", "Radix"],
    year: "2023",
  },
  {
    num: "03",
    name: "Quartz,",
    nameEm: "tiny reactive runtime",
    desc: "3kB signals library with first-class async and a debugger inspired by audio DAWs. 14k stars on GitHub.",
    role: "Author",
    tags: ["TS", "Signals", "OSS"],
    year: "2023",
  },
  {
    num: "04",
    name: "Atlas,",
    nameEm: "fault-tolerant ledger",
    desc: "Double-entry ledger for a payments processor moving $1.2B/yr · idempotent by construction · event-sourced.",
    role: "Senior Engineer",
    tags: ["Go", "Kafka", "PG"],
    year: "2022",
  },
  {
    num: "05",
    name: "Fieldnote,",
    nameEm: "local-first notebook",
    desc: "Markdown notebook with full-text search, e2e sync, plugin system on a postcard · three months solo · 10k MAU.",
    role: "Solo",
    tags: ["Swift", "Rust", "CRDT"],
    year: "2022",
  },
  {
    num: "06",
    name: "Brut.io,",
    nameEm: "edge function platform",
    desc: "A V8 isolate runtime + scheduler for sub-100ms cold-starts globally · open-source, mid-five-figure deploys.",
    role: "Eng Lead",
    tags: ["Rust", "V8", "Edge"],
    year: "2021",
  },
  {
    num: "07",
    name: "Cinder,",
    nameEm: "terminal scheduler",
    desc: "A tiny cron-replacement with structured outputs, retries, and a tui. Birthday-project gone semi-popular.",
    role: "Author",
    tags: ["Go", "TUI", "OSS"],
    year: "2020",
  },
  {
    num: "08",
    name: "Stripe ·",
    nameEm: "merchant tooling",
    desc: "Internal devtools · onboarding flows · latency work on the API edge. Years of small, important fixes.",
    role: "Software Engineer",
    tags: ["Ruby", "Scala", "JS"],
    year: "2017—20",
  },
  {
    num: "09",
    name: "Lume,",
    nameEm: "WebGL data lab",
    desc: "A shader-driven visualization library used by a couple of newsrooms. Built for the joy of it.",
    role: "Author",
    tags: ["GLSL", "WebGL", "OSS"],
    year: "2016",
  },
  {
    num: "10",
    name: "Studio ·",
    nameEm: "independent work",
    desc: "Interactive work for cultural institutions, agencies, and a handful of early-stage startups.",
    role: "Freelance",
    tags: ["Various"],
    year: "2014—17",
  },
];

export const Work: React.FC = () => {
  useDesignAnimations();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });
      const heroWords = document.querySelectorAll<HTMLElement>(".w-hero h1 .word > span");
      tl.set(heroWords, { yPercent: 110 });
      tl.set(".w-label, .w-lede > *", { autoAlpha: 0, y: 18 });
      tl.set(".ds-nav", { autoAlpha: 0, y: -16 });

      tl.to(".ds-nav", { autoAlpha: 1, y: 0, duration: 0.8 }, 0)
        .to(".w-label", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
        .to(heroWords, { yPercent: 0, duration: 1.1, stagger: 0.05 }, 0.25)
        .to(".w-lede > *", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.9);

      // Stats entrance
      gsap.from(".w-stats .stat", {
        y: 20,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".w-stats", start: "top 90%" },
      });

      // Archive rows entrance
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
            <Word>Twelve</Word> <Word em>years</Word> <Word>of</Word>{" "}
            <Word>shipping.</Word>
          </h1>
          <div className="w-lede">
            <div className="l">Selected · 2014 — 2026</div>
            <div className="r">
              Things I've made, broken, fixed, deleted and shipped — across
              distributed systems, dev tooling, and the thin glass between
              people and machines.
            </div>
          </div>
        </div>
      </section>

      <div className="w-stats">
        <div className="stat">
          <div className="num">
            <NumberTicker value={12} />
            <span className="suffix">yrs</span>
          </div>
          <div className="lbl">Years shipping production software</div>
        </div>
        <div className="stat">
          <div className="num">
            <NumberTicker value={48} />
            <span className="suffix">·</span>
          </div>
          <div className="lbl">Projects launched end-to-end</div>
        </div>
        <div className="stat">
          <div className="num">
            <NumberTicker value={3} />
            <span className="suffix">×</span>
          </div>
          <div className="lbl">Founding engineer · venture-backed</div>
        </div>
        <div className="stat">
          <div className="num">
            <NumberTicker value={220} />
            <span className="suffix">M</span>
          </div>
          <div className="lbl">Monthly events processed · peak</div>
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
          <a key={r.num} className="w-row" href={r.href || "#"} data-magnet="0.05">
            <div className="idx">{r.num}</div>
            <div className="pname">
              {r.name} <em>{r.nameEm}</em>
              <span className="desc">{r.desc}</span>
            </div>
            <div className="role">{r.role}</div>
            <div className="tags">
              {r.tags.map((t) => (
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

  @media (max-width: 900px) {
    .w-hero { padding: 120px 24px 60px; }
    .w-archive { padding: 0 24px 100px; }
    .row-head, .w-row { grid-template-columns: 40px 1fr; gap: 16px; }
    .row-head > *:nth-child(n+3),
    .w-row > *:nth-child(n+3) { display: none; }
    .w-stats { grid-template-columns: 1fr 1fr; padding: 32px 24px; margin: 0 24px 80px; }
    .w-lede { grid-template-columns: 1fr; gap: 16px; }
    .w-cta { padding: 64px 24px; }
  }
`;
