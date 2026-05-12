import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DesignLayout,
  Marquee,
  Chip,
  Btn,
  ShimmerBtn,
  GridBg,
  Word,
} from "../../design";
import { useDesignAnimations } from "../../../Hooks/useDesignAnimations";

gsap.registerPlugin(ScrollTrigger);

type Panel = {
  num: string;
  year: string;
  title: string;
  titleEm: string;
  titleTail: string;
  body: string;
  role: string;
  org: string;
  tags: string[];
};

const PANELS: Panel[] = [
  {
    num: "01 / 06",
    year: "2024 — Now",
    title: "Halcyon —",
    titleEm: "real-time",
    titleTail: "analytics editor.",
    body: "Multiplayer SQL workspace · sub-50ms p99 · streaming layer + CRDT editor + type-aware completion.",
    role: "Staff Engineer",
    org: "Northbeam · remote",
    tags: ["Rust", "WASM", "TS"],
  },
  {
    num: "02 / 06",
    year: "2023",
    title: "Tessera —",
    titleEm: "type-driven",
    titleTail: "design system.",
    body: "Token-first component library replacing four divergent UI codebases with a single source of truth.",
    role: "Founding Eng",
    org: "Loop Labs · Berlin",
    tags: ["React", "Radix", "TS"],
  },
  {
    num: "03 / 06",
    year: "2023",
    title: "Quartz —",
    titleEm: "tiny",
    titleTail: "reactive runtime.",
    body: "3kB signals library with first-class async and a debugger inspired by audio DAWs. 14k stars.",
    role: "Author",
    org: "Open source",
    tags: ["TS", "Signals", "OSS"],
  },
  {
    num: "04 / 06",
    year: "2022",
    title: "Atlas —",
    titleEm: "fault-tolerant",
    titleTail: "ledger.",
    body: "Double-entry ledger for a $1.2B/yr payments processor. Idempotent, event-sourced, engineer-loved.",
    role: "Senior Engineer",
    org: "Atlas Pay · London",
    tags: ["Go", "Kafka", "PG"],
  },
  {
    num: "05 / 06",
    year: "2022",
    title: "Fieldnote —",
    titleEm: "local-first",
    titleTail: "notebook.",
    body: "Markdown notebook · e2e sync, full-text search, plugin system on a postcard. 3 months solo.",
    role: "Solo",
    org: "Self-funded",
    tags: ["Swift", "Rust", "CRDT"],
  },
  {
    num: "06 / 06",
    year: "2021",
    title: "Brut.io —",
    titleEm: "edge function",
    titleTail: "platform.",
    body: "V8 isolate runtime + scheduler · sub-100ms cold-starts globally, open-source, mid-five-figure deploys.",
    role: "Engineering Lead",
    org: "Open source",
    tags: ["Rust", "V8", "Edge"],
  },
];

const STACKS = [
  {
    case: "Case study · A",
    name: "Halcyon",
    year: "2024 — Now",
    title: "A",
    titleEm: "real-time",
    titleTail: "editor for analysts who type fast.",
    body: "We replaced a 14-second round-trip with a single keystroke. The execution layer is a Rust streaming engine compiled to WebAssembly, the editor is a CRDT-backed multiplayer model, and the completion engine knows your schema. The result: a tool that feels closer to a synthesizer than a SQL client.",
    tags: ["Rust", "WASM", "TypeScript", "Postgres", "WebSockets", "CRDT"],
    links: [
      { label: "View live →", href: "#" },
      { label: "Read writeup →", href: "#" },
      { label: "Slack me ↗", href: "#" },
    ],
  },
  {
    case: "Case study · B",
    name: "Tessera",
    year: "2023",
    title: "A design",
    titleEm: "system",
    titleTail: "on the boring side of clever.",
    body: "Forty engineers, four product surfaces, a thousand inconsistent buttons. Tessera is the type-driven library we shipped to consolidate them — Figma variables compiled to design tokens, primitives built on Radix, themes that survive contract.",
    tags: ["TypeScript", "React", "Radix", "Style Dictionary", "Storybook"],
    links: [
      { label: "View docs →", href: "#" },
      { label: "GitHub ↗", href: "#" },
    ],
  },
  {
    case: "Case study · C",
    name: "Atlas",
    year: "2022",
    title: "A",
    titleEm: "ledger",
    titleTail: "that engineers actually want to query.",
    body: 'Atlas is a double-entry, event-sourced ledger moving $1.2B/yr. The interesting part isn\'t the writes — it\'s the query layer, which lets you ask "what was this account at this exact second" without writing a six-way join. Idempotent by construction, instrumented to the bone.',
    tags: ["Go", "Kafka", "Postgres", "Event sourcing", "gRPC"],
    links: [
      { label: "Read post-mortem →", href: "#" },
      { label: "Talk slides ↗", href: "#" },
    ],
  },
];

export const Projects: React.FC = () => {
  const hscrollRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeTick, setActiveTick] = useState(0);
  useDesignAnimations();

  // Hero entrance.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });
      const heroWords = document.querySelectorAll<HTMLElement>(".p-hero h1 .word > span");
      tl.set(heroWords, { yPercent: 110 });
      tl.set(".p-label, .p-meta > *", { autoAlpha: 0, y: 18 });
      tl.set(".ds-nav", { autoAlpha: 0, y: -16 });

      tl.to(".ds-nav", { autoAlpha: 1, y: 0, duration: 0.8 }, 0)
        .to(".p-label", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
        .to(heroWords, { yPercent: 0, duration: 1.1, stagger: 0.05 }, 0.25)
        .to(".p-meta > *", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.9);
    });
    return () => ctx.revert();
  }, []);

  // Horizontal pinned scroll (desktop only).
  useEffect(() => {
    const section = hscrollRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;

    const ctx = gsap.context(() => {
      const getDist = () => Math.max(0, track.scrollWidth - section.clientWidth);
      gsap.to(track, {
        x: () => -getDist(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: () => `+=${getDist()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const i = Math.min(5, Math.floor(self.progress * 6));
            setActiveTick(i);
          },
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  // Scroll-triggered split-reveal for below-the-fold data-split elements (interlude h2, cta h2).
  useEffect(() => {
    const ctx = gsap.context(() => {
      document
        .querySelectorAll<HTMLElement>(".interlude [data-split], .p-cta [data-split]")
        .forEach((el) => {
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

  return (
    <DesignLayout>
      {/* HERO */}
      <section className="p-hero">
        <div className="p-hero-bg">
          <GridBg count={2} />
        </div>
        <div>
          <div className="p-label">02 / Projects · case studies</div>
          <h1 data-split>
            <Word>Six</Word> <Word>things,</Word> <Word>in</Word>{" "}
            <Word em>depth.</Word>
          </h1>
          <div className="p-meta">
            <div className="lede">
              Each one a small bet on what software could feel like — built
              slowly, tested in production, written down honestly.
            </div>
            <div>
              <span className="k">Case studies</span>
              <span className="v">06</span>
            </div>
            <div>
              <span className="k">Span</span>
              <span className="v">2021 — 2026</span>
            </div>
            <div>
              <span className="k">Scroll</span>
              <span className="v">→ horizontal</span>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL SHOWCASE */}
      <section className="hscroll-section" ref={hscrollRef}>
        <div className="hscroll-track" ref={trackRef}>
          <div className="hs-title">
            <div className="hs-tag">Section · 01</div>
            <h2>
              <em>Recent</em> work, slid sideways.
            </h2>
            <p className="hs-sub">
              Scroll vertically — the panels slide. Six selected case studies.
            </p>
          </div>

          {PANELS.map((p) => (
            <article key={p.num} className="panel">
              <span className="num">{p.num}</span>
              <span className="badge-y">{p.year}</span>
              <div className="visual">
                <div className="thumb-ph">
                  <span>{p.title.toLowerCase().replace(/\s—.*/, "")} · {p.year}</span>
                </div>
              </div>
              <div className="info">
                <div>
                  <h3>
                    {p.title} <em>{p.titleEm}</em> {p.titleTail}
                  </h3>
                  <p>{p.body}</p>
                </div>
                <div className="right">
                  <div className="role">
                    {p.role}
                    <br />
                    {p.org}
                  </div>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}

          <div className="hs-end">
            <div className="hs-tag">End of reel</div>
            <h3>
              That's the <em>six.</em>
            </h3>
            <Btn to="/work">
              <span>See the full archive</span>
              <span>→</span>
            </Btn>
          </div>
        </div>

        <div className="hs-indicator">
          <span>{String(activeTick + 1).padStart(2, "0")} / 06</span>
          <div className="ticks">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`tick${i <= activeTick ? " is-active" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      {/* INTERLUDE */}
      <section className="interlude">
        <div>
          <h2 data-split>
            <Word>The</Word> <Word em>process,</Word> <Word>mostly.</Word>
          </h2>
        </div>
        <p>
          Each of these started as a one-page brief and turned into a year. I
          keep these case studies short on purpose — full writeups
          (architecture diagrams, decisions, post-mortems) are available on
          request.
        </p>
      </section>

      {/* STACKED CASE-STUDY CARDS */}
      <section className="stacks">
        {STACKS.map((s, i) => (
          <article
            key={s.name}
            className="stack-item"
            style={{ top: `${8 + i * 3}vh`, zIndex: i + 1 }}
          >
            <div className="vis" data-image-in>
              <span className="corner">{s.case}</span>
              <div className="thumb-ph">
                <span>{s.name.toLowerCase()}</span>
              </div>
            </div>
            <div className="txt">
              <div className="top">
                <span>{s.name}</span>
                <span>{s.year}</span>
              </div>
              <div>
                <h3>
                  {s.title} <em>{s.titleEm}</em> {s.titleTail}
                </h3>
                <p className="body">{s.body}</p>
                <div className="tags">
                  {s.tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
              <div className="links">
                {s.links.map((l) => (
                  <a key={l.label} href={l.href} data-magnet="0.2">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section className="p-cta">
        <div className="p-cta-bg">
          <GridBg count={3} />
        </div>
        <h2>
          <Word>Want</Word> <Word>the</Word> <Word em>longer</Word>{" "}
          <Word>version?</Word>
        </h2>
        <div className="p-cta-actions">
          <ShimmerBtn to="/contact">
            Request case studies ↗
          </ShimmerBtn>
          <Btn to="/work">
            <span>See archive</span>
            <span>→</span>
          </Btn>
        </div>
      </section>

      <Marquee
        items={[
          "Distributed systems",
          "Editor tooling",
          "Local-first",
          "Type-driven",
          "Performance",
          "Quiet interfaces",
        ]}
      />

      <style>{styles}</style>
    </DesignLayout>
  );
};

const styles = `
  /* Hero */
  .p-hero {
    min-height: 90vh; padding: 160px 56px 60px;
    max-width: var(--maxw); margin: 0 auto;
    display: grid; align-items: end; position: relative;
  }
  .p-hero-bg { position: absolute; inset: 0; opacity: .35; }
  .p-label {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; margin-bottom: 32px;
    display: flex; align-items: center; gap: 12px;
  }
  .p-label::before { content: ""; width: 32px; height: 1px; background: var(--ink); }
  .p-hero h1 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(72px, 14vw, 220px);
    line-height: 0.86; letter-spacing: -0.02em;
  }
  .p-hero h1 em { font-style: italic; color: var(--accent); }
  .p-meta {
    margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--line);
    display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 32px;
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: .14em;
  }
  .p-meta .k { display: block; color: var(--muted); margin-bottom: 6px; font-size: 10px; opacity: .7; }
  .p-meta .v { color: var(--ink); font-size: 12px; }
  .p-meta .lede {
    font-family: var(--serif); font-style: italic;
    font-size: 22px; line-height: 1.4; color: var(--ink-2);
    text-transform: none; letter-spacing: 0; max-width: 42ch;
  }

  /* Horizontal scroll */
  .hscroll-section {
    height: 100vh; width: 100vw; overflow: hidden;
    position: relative; background: var(--bg);
  }
  .hscroll-track {
    display: flex; height: 100%; align-items: center;
    padding: 0 8vw; gap: 56px; will-change: transform;
  }
  .hs-title {
    flex: 0 0 auto; width: 60vw; padding-right: 4vw; align-self: center;
  }
  .hs-tag {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; margin-bottom: 20px;
    display: flex; align-items: center; gap: 12px;
  }
  .hs-tag::before { content: ""; width: 32px; height: 1px; background: var(--ink); }
  .hs-title h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(64px, 10vw, 180px);
    line-height: 0.88; letter-spacing: -0.02em;
  }
  .hs-title h2 em { font-style: italic; color: var(--accent); }
  .hs-sub {
    margin-top: 28px; font-family: var(--serif); font-style: italic;
    font-size: 22px; line-height: 1.4; color: var(--ink-2); max-width: 36ch;
  }

  .panel {
    flex: 0 0 auto; width: 56vw; height: 72vh;
    border: 1px solid var(--line); border-radius: 6px;
    background: var(--bg); position: relative; overflow: hidden;
    display: grid; grid-template-rows: 1fr auto;
    transition: transform .5s var(--ease);
  }
  .panel:hover { transform: translateY(-4px); }
  .panel .visual {
    position: relative; overflow: hidden;
    background: var(--bg-deep);
    border-bottom: 1px solid var(--line);
  }
  .panel .num {
    position: absolute; left: 24px; top: 24px;
    font-family: var(--mono); font-size: 11px; letter-spacing: .14em;
    color: var(--muted); text-transform: uppercase; z-index: 2;
    background: var(--bg); padding: 6px 10px;
    border: 1px solid var(--line); border-radius: 2px;
  }
  .panel .badge-y {
    position: absolute; right: 24px; top: 24px;
    font-family: var(--mono); font-size: 11px; letter-spacing: .14em;
    color: var(--ink); text-transform: uppercase; z-index: 2;
    background: var(--bg); padding: 6px 10px;
    border: 1px solid var(--line); border-radius: 2px;
  }
  .panel .info {
    padding: 28px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px;
    align-items: end;
  }
  .panel .info h3 {
    font-family: var(--serif); font-weight: 400;
    font-size: 36px; line-height: 1.05; letter-spacing: -0.01em;
  }
  .panel .info h3 em { font-style: italic; color: var(--accent); }
  .panel .info p { font-size: 14px; line-height: 1.6; color: var(--ink-2); margin-top: 12px; }
  .panel .info .right { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; }
  .panel .info .role {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted); text-align: right;
  }
  .panel .info .tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }

  .hs-end {
    flex: 0 0 auto; width: 40vw; align-self: center; text-align: left;
  }
  .hs-end h3 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 5vw, 80px); line-height: 1.0;
    letter-spacing: -0.02em; margin-bottom: 32px;
  }
  .hs-end h3 em { font-style: italic; color: var(--accent); }

  .hs-indicator {
    position: absolute; right: 56px; bottom: 56px; z-index: 5;
    display: flex; gap: 6px; align-items: center;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
    pointer-events: none;
  }
  .hs-indicator .ticks { display: flex; gap: 4px; }
  .hs-indicator .tick {
    width: 24px; height: 1px; background: var(--muted); opacity: .35;
    transition: opacity .3s, background .3s;
  }
  .hs-indicator .tick.is-active { background: var(--accent); opacity: 1; }

  /* Interlude */
  .interlude {
    padding: 160px 56px; max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: end;
  }
  .interlude h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 6.5vw, 110px); line-height: 0.92;
    letter-spacing: -0.02em;
  }
  .interlude h2 em { font-style: italic; color: var(--accent); }
  .interlude p {
    font-family: var(--serif); font-style: italic;
    font-size: 22px; line-height: 1.4; color: var(--ink-2); max-width: 42ch;
  }

  /* Stacks */
  .stacks { padding: 0 56px 200px; max-width: var(--maxw); margin: 0 auto; }
  .stack-item {
    position: sticky; margin-bottom: 32px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--bg); overflow: hidden;
    display: grid; grid-template-columns: 1fr 1fr;
    min-height: 70vh;
    transition: transform .5s var(--ease);
    box-shadow: 0 12px 32px rgba(22, 21, 19, 0.04);
  }
  .stack-item .vis {
    position: relative; background: var(--bg-deep); overflow: hidden;
    border-right: 1px solid var(--line);
  }
  .stack-item .vis .corner {
    position: absolute; left: 24px; top: 24px; z-index: 2;
    font-family: var(--mono); font-size: 10px; letter-spacing: .14em;
    color: var(--muted); text-transform: uppercase;
    background: var(--bg); padding: 6px 10px;
    border: 1px solid var(--line); border-radius: 2px;
  }
  .stack-item .txt {
    padding: 56px;
    display: flex; flex-direction: column; justify-content: space-between;
    gap: 32px;
  }
  .stack-item .txt .top {
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--muted);
  }
  .stack-item .txt h3 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(40px, 4.5vw, 64px); line-height: 1.0;
    letter-spacing: -0.01em;
  }
  .stack-item .txt h3 em { font-style: italic; color: var(--accent); }
  .stack-item .txt .body { font-size: 15px; line-height: 1.7; color: var(--ink-2); max-width: 50ch; margin-top: 20px; }
  .stack-item .txt .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 24px; }
  .stack-item .txt .links {
    display: flex; gap: 24px; align-items: center;
    padding-top: 24px; border-top: 1px solid var(--line);
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em;
  }
  .stack-item .txt .links a {
    display: inline-flex; align-items: center; gap: 8px;
    transition: gap .3s, color .3s;
  }
  .stack-item .txt .links a:hover { gap: 14px; color: var(--accent); }

  /* CTA */
  .p-cta {
    margin-top: 80px; padding: 96px 56px;
    border-top: 1px solid var(--line); position: relative; overflow: hidden;
    max-width: var(--maxw); margin-left: auto; margin-right: auto;
  }
  .p-cta-bg { position: absolute; inset: 0; opacity: .5; }
  .p-cta h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 8vw, 140px); line-height: 0.92; letter-spacing: -0.03em;
    text-align: center; position: relative;
  }
  .p-cta h2 em { font-style: italic; color: var(--accent); }
  .p-cta-actions {
    margin-top: 48px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    position: relative;
  }

  @media (max-width: 1100px) {
    .hs-title { width: 80vw; }
    .panel { width: 78vw; }
    .hs-end { width: 60vw; }
  }
  @media (max-width: 900px) {
    .p-hero { padding: 120px 24px 60px; }
    .p-meta { grid-template-columns: 1fr 1fr; gap: 20px; }
    .interlude { padding: 100px 24px; grid-template-columns: 1fr; gap: 32px; }
    .stacks { padding: 0 24px 120px; }
    .stack-item {
      grid-template-columns: 1fr; min-height: auto;
      position: static !important; margin-bottom: 24px;
    }
    .stack-item .vis { aspect-ratio: 16/10; border-right: none; border-bottom: 1px solid var(--line); }
    .stack-item .txt { padding: 32px; }
    .hscroll-section { height: auto; }
    .hscroll-track { flex-direction: column; padding: 0 24px; gap: 24px; }
    .hs-title, .hs-end, .panel { width: 100%; height: auto; }
    .panel { aspect-ratio: 4/5; }
    .hs-indicator { display: none; }
    .p-cta { padding: 64px 24px; }
  }
`;
