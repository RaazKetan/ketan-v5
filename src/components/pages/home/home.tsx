import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import {
  Btn,
  Chip,
  GridBg,
  Marquee,
  SectionTag,
  ShimmerBtn,
  BeamFrame,
  Word,
  Reveal,
  BlurFade,
  ScrollHint,
  DesignLayout,
} from "../../design";
import { useDesignAnimations } from "../../../Hooks/useDesignAnimations";
import { usePersonalData } from "../../../context/PersonalDataContext";

gsap.registerPlugin(ScrollTrigger);

const FEATURED = [
  {
    slug: "halcyon",
    org: "Northbeam",
    kind: "Real-time",
    year: "2024",
    title: "Halcyon — a",
    titleEm: "real-time",
    titleTail: "analytics editor.",
    body: "Multiplayer SQL workspace with sub-50ms p99 query feedback. Built the streaming layer, the CRDT editor, and the type-aware completion engine.",
    tags: ["Rust", "WASM", "TypeScript"],
  },
  {
    slug: "tessera",
    org: "Loop Labs",
    kind: "Design system",
    year: "2023",
    title: "Tessera — a",
    titleEm: "type-driven",
    titleTail: "design system.",
    body: "Token-first component library for a 40-engineer org. Replaced four divergent UI codebases with a single source of truth.",
    tags: ["TypeScript", "React", "Radix"],
  },
  {
    slug: "quartz",
    org: "Open source",
    kind: "Library",
    year: "2023",
    title: "Quartz — a",
    titleEm: "tiny",
    titleTail: "reactive runtime.",
    body: "A 3kB signals library with first-class async and a debugger inspired by audio DAWs. 14k stars on GitHub.",
    tags: ["TypeScript", "Signals", "OSS"],
  },
  {
    slug: "atlas",
    org: "Atlas Pay",
    kind: "Infra",
    year: "2022",
    title: "Atlas — a",
    titleEm: "fault-tolerant",
    titleTail: "ledger.",
    body: "Double-entry ledger for a payments processor moving $1.2B/year. Idempotent by construction, event-sourced, query layer engineers enjoy.",
    tags: ["Go", "Kafka", "Postgres"],
  },
];

const Home: React.FC = () => {
  const { heroTitle } = usePersonalData();
  const heroRef = useRef<HTMLElement>(null);
  useDesignAnimations();

  // Hero entrance timeline.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });
      tl.set(".hero-name .word > span", { yPercent: 110 });
      tl.set(".hero-eyebrow", { autoAlpha: 0, y: 12 });
      tl.set(".hero-tagline > *", { autoAlpha: 0, y: 18 });
      tl.set(".hero-bottom > *", { autoAlpha: 0, y: 18 });
      tl.set(".scroll-hint", { autoAlpha: 0, y: 18 });
      tl.set(".ds-nav", { autoAlpha: 0, y: -16 });

      tl.to(".ds-nav", { autoAlpha: 1, y: 0, duration: 0.8 }, 0)
        .to(".hero-eyebrow", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
        .to(".hero-name .word > span", { yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.25)
        .to(".hero-tagline > *", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.9)
        .to(".hero-bottom > *", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 1.05)
        .to(".scroll-hint", { autoAlpha: 1, y: 0, duration: 0.6 }, 1.2);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Split-reveal for the "A few recent things" header.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-split]");
    const ctx = gsap.context(() => {
      els.forEach((el) => {
        const inners = el.querySelectorAll(".word > span");
        gsap.set(inners, { yPercent: 110 });
        gsap.to(inners, {
          yPercent: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  const [first, ...rest] = heroTitle.name.split(" ");
  const lastName = rest.length ? rest.join(" ") : "";

  return (
    <DesignLayout>
      <section className="hero-section" ref={heroRef}>
        <div className="hero-grid-bg">
          <GridBg count={3} />
        </div>

        <div className="hero-eyebrow">
          <span className="ey-tag">Portfolio · 2026</span>
          <span className="ey-divider" />
          <span>{heroTitle.title || "Software Engineer"}</span>
          <span className="ey-divider" />
          <span>{heroTitle.location || "India"} · IST</span>
        </div>

        <h1 className="hero-name" aria-label={heroTitle.name}>
          <div className="row">
            <Word>{first}</Word>
            {lastName && <Word em>{lastName}.</Word>}
          </div>
        </h1>

        <div className="hero-tagline">
          <div className="tag-line">
            <span className="t-num">01</span>
            <span className="t-body">
              Building <em>quiet systems</em> &amp; intelligent agents for teams who care about
              the second order of effects.
            </span>
          </div>
          <div className="tag-actions">
            <Btn to="/projects" primary>
              <span>Selected work</span>
              <span>→</span>
            </Btn>
            <Btn to="/about">
              <span>About me</span>
              <span>↗</span>
            </Btn>
          </div>
        </div>

        <div className="hero-bottom">
          <div className="hero-meta">
            <div>
              <span className="k">Engineer</span>
              <span className="v">{heroTitle.name}</span>
            </div>
            <div>
              <span className="k">Based in</span>
              <span className="v">{heroTitle.location || "India"}</span>
            </div>
            <div>
              <span className="k">Focus</span>
              <span className="v">Systems · Agents · Backend</span>
            </div>
            <div>
              <span className="k">Available</span>
              <span className="v">
                <span className="led-inline" />
                Q2 2026
              </span>
            </div>
          </div>

          <div className="hero-strip">
            <div className="col">
              <h5>Currently</h5>
              <ul>
                <li>
                  <span>SWE @ {heroTitle.company}</span>
                  <span>'25—</span>
                </li>
                <li>
                  <span>Agent systems / ADK</span>
                  <span>now</span>
                </li>
                <li>
                  <span>Writing on engineering</span>
                  <span>weekly</span>
                </li>
              </ul>
            </div>
            <div className="col">
              <h5>Exploring</h5>
              <ul>
                <li>
                  <span>LLM orchestration</span>
                  <span>'26</span>
                </li>
                <li>
                  <span>Distributed systems</span>
                  <span>'25</span>
                </li>
                <li>
                  <span>Database-first design</span>
                  <span>'24</span>
                </li>
              </ul>
            </div>
            <div className="col">
              <h5>Stack</h5>
              <ul>
                <li>
                  <span>TypeScript · Go · Python</span>
                  <span>—</span>
                </li>
                <li>
                  <span>Postgres · Redis · Kafka</span>
                  <span>—</span>
                </li>
                <li>
                  <span>React · GSAP · Three.js</span>
                  <span>—</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <ScrollHint label="Scroll · 01/04" />
      </section>

      <Marquee
        items={[
          "Agent systems",
          "Distributed backends",
          "Type-driven design",
          "Performance",
          "Local-first",
          "Automation",
          "Quiet interfaces",
          "Slow productivity",
        ]}
      />

      <section className="feature-section">
        <SectionTag>Index · 02 / Featured</SectionTag>

        <div className="feature-head">
          <h2 data-split>
            <Word>A</Word> <Word>few</Word>{" "}
            <Word em>recent</Word> <Word>things.</Word>
          </h2>
          <div className="feature-head-aside">
            Four highlights — explore the full archive on the projects page.
          </div>
        </div>

        <div className="feature-grid">
          {FEATURED.map((p, i) => (
            <BlurFade key={p.slug} delay={i * 0.08} className="feature-card-wrap">
              <Link to="/projects" className="feature-card">
                <div className="img">
                  <div className="thumb-ph">
                    <span>
                      {p.slug} · {p.year}
                    </span>
                  </div>
                </div>
                <div className="info">
                  <div className="meta-row">
                    <span>{p.org}</span>
                    <span>{p.kind}</span>
                  </div>
                  <h3>
                    {p.title} <em>{p.titleEm}</em> {p.titleTail}
                  </h3>
                  <p>{p.body}</p>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>

        <div className="more-work-cta">
          <BeamFrame>
            <Btn to="/projects">
              <span>View all work</span>
              <span>→</span>
            </Btn>
          </BeamFrame>
        </div>
      </section>

      <section className="cta-strip">
        <div className="cta-strip-bg">
          <GridBg count={2} />
        </div>
        <h2>
          <Word>Have</Word> <Word>an</Word> <Word>idea</Word>{" "}
          <Word>worth</Word> <Word em>building?</Word>
        </h2>
        <Reveal className="cta-actions">
          <ShimmerBtn to="/about">
            Start a conversation ↗
          </ShimmerBtn>
          <Btn to="/about">
            <span>About me</span>
            <span>→</span>
          </Btn>
        </Reveal>
      </section>

      <style>{styles}</style>
    </DesignLayout>
  );
};

const styles = `
  .hero-section {
    min-height: 100vh; padding: 132px 56px 80px;
    max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-rows: auto 1fr auto auto;
    position: relative;
  }
  .hero-grid-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

  .hero-eyebrow {
    display: flex; align-items: center; gap: 16px;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
    position: relative; z-index: 2; padding-top: 8px;
  }
  .hero-eyebrow .ey-tag { color: var(--ink); }
  .hero-eyebrow .ey-divider { width: 24px; height: 1px; background: var(--line); }

  .hero-name {
    margin: auto 0;
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(96px, 19vw, 320px);
    line-height: 0.9; letter-spacing: -0.04em;
    position: relative; z-index: 2;
  }
  .hero-name .row { display: flex; align-items: baseline; gap: clamp(20px, 4vw, 64px); flex-wrap: wrap; }
  .hero-name em { font-style: italic; color: var(--accent); }

  .hero-tagline {
    margin-top: 32px;
    display: grid; grid-template-columns: 1.6fr 1fr;
    gap: 64px; align-items: end;
    padding-top: 32px; border-top: 1px solid var(--line);
    position: relative; z-index: 2;
  }
  .hero-tagline .tag-line {
    display: grid; grid-template-columns: 32px 1fr; gap: 24px;
    align-items: baseline;
  }
  .hero-tagline .t-num {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; padding-top: 8px;
  }
  .hero-tagline .t-body {
    font-family: var(--serif); font-style: italic;
    font-size: clamp(22px, 2.6vw, 32px); line-height: 1.35; color: var(--ink);
    max-width: 36ch;
  }
  .hero-tagline .t-body em { font-style: italic; color: var(--accent); }
  .hero-tagline .tag-actions {
    display: flex; gap: 12px; justify-content: flex-end; align-items: center; flex-wrap: wrap;
  }

  .hero-bottom { margin-top: 56px; position: relative; z-index: 2; }
  .hero-meta {
    display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 32px; font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
    padding: 20px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  }
  .hero-meta .k { display: block; color: var(--muted); margin-bottom: 6px; font-size: 10px; opacity: .7; }
  .hero-meta .v { color: var(--ink); font-size: 12px; display: inline-flex; align-items: center; gap: 8px; }
  .hero-meta .led-inline { width: 6px; height: 6px; border-radius: 50%; background: #2a9b6f; box-shadow: 0 0 8px #2a9b6f; }

  .hero-strip {
    margin-top: 28px;
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 48px;
    align-items: start;
  }
  .hero-strip .col h5 {
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em;
    color: var(--muted); margin-bottom: 12px;
  }
  .hero-strip .col ul li {
    list-style: none; padding: 6px 0; font-size: 14px;
    display: flex; justify-content: space-between; border-bottom: 1px dashed var(--line);
  }
  .hero-strip .col ul li:last-child { border-bottom: none; }
  .hero-strip .col ul li span:last-child { color: var(--muted); font-family: var(--mono); font-size: 11px; }

  .feature-section { padding: 160px 56px 120px; max-width: var(--maxw); margin: 0 auto; }
  .feature-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 64px; gap: 48px;
  }
  .feature-head h2 {
    font-family: var(--serif); font-size: clamp(56px, 8vw, 132px);
    line-height: 0.9; letter-spacing: -0.02em; font-weight: 400;
  }
  .feature-head h2 em { font-style: italic; color: var(--accent); }
  .feature-head-aside {
    font-family: var(--mono); font-size: 12px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--muted); max-width: 28ch; text-align: right;
  }
  .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .feature-card-wrap { display: block; }
  .feature-card {
    display: block;
    border: 1px solid var(--line); border-radius: 6px;
    background: var(--bg); overflow: hidden; position: relative;
    transition: transform .5s var(--ease);
  }
  .feature-card:hover { transform: translateY(-4px); }
  .feature-card .img {
    aspect-ratio: 16/10; position: relative; background: var(--bg-deep);
    border-bottom: 1px solid var(--line); overflow: hidden;
  }
  .feature-card .info { padding: 28px; }
  .feature-card .meta-row {
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: var(--mono); font-size: 10px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--muted); margin-bottom: 12px;
  }
  .feature-card h3 {
    font-family: var(--serif); font-size: 32px; line-height: 1.05;
    font-weight: 400; letter-spacing: -0.01em; margin-bottom: 12px;
  }
  .feature-card h3 em { font-style: italic; color: var(--accent); }
  .feature-card p { font-size: 14px; line-height: 1.6; color: var(--ink-2); }
  .feature-card .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }

  .more-work-cta { margin-top: 64px; display: flex; justify-content: center; }

  .cta-strip {
    margin-top: 80px; padding: 96px 56px;
    border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
    position: relative; overflow: hidden;
    max-width: var(--maxw); margin-left: auto; margin-right: auto;
  }
  .cta-strip-bg { position: absolute; inset: 0; opacity: .5; }
  .cta-strip h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(56px, 9vw, 160px);
    line-height: 0.92; letter-spacing: -0.03em;
    text-align: center; position: relative;
  }
  .cta-strip h2 em { font-style: italic; color: var(--accent); }
  .cta-actions {
    margin-top: 48px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    position: relative;
  }

  @media (max-width: 1100px) {
    .hero-name { font-size: clamp(72px, 15vw, 180px); }
    .hero-tagline { grid-template-columns: 1fr; gap: 24px; }
    .hero-tagline .tag-actions { justify-content: flex-start; }
  }
  @media (max-width: 900px) {
    .hero-section { padding: 110px 24px 60px; }
    .feature-section { padding: 100px 24px 80px; }
    .hero-meta { grid-template-columns: 1fr 1fr; gap: 20px; }
    .hero-strip { grid-template-columns: 1fr; gap: 24px; }
    .feature-grid { grid-template-columns: 1fr; }
    .feature-head { flex-direction: column; align-items: flex-start; gap: 24px; }
    .feature-head-aside { text-align: left; }
    .cta-strip { padding: 64px 24px; }
  }
`;

export default Home;
