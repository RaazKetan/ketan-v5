import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
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
import { PROJECTS, BLOGS } from "../../../data/projects";

gsap.registerPlugin(ScrollTrigger);

const PANELS = PROJECTS.map((p, i) => ({
  ...p,
  num: `${String(i + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`,
}));

/* All projects get the full case-study treatment in the stacked section. */
const STACKS = PROJECTS.map((p, i) => ({
  ...p,
  case: `Case study · ${String.fromCharCode(65 + i)}`,
}));

const NUMBER_WORDS: Record<number, string> = {
  1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six",
};
const wordFor = (n: number) => NUMBER_WORDS[n] ?? String(n);

export const Projects: React.FC = () => {
  const hscrollRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeTick, setActiveTick] = useState(0);
  useDesignAnimations();

  // Hero entrance - scoped to hscrollRef so StrictMode handles cleanup.
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });
    tl.from(".p-label", { autoAlpha: 0, y: 18, duration: 1.1 }, 0)
      .from(".p-hero h1 .word > span", { yPercent: 110, duration: 1.6, stagger: 0.12 }, 0.2)
      .from(".p-meta > *", { autoAlpha: 0, y: 18, duration: 1.2, stagger: 0.12 }, 1.2);
  });

  // Horizontal scroll via sticky-inner-viewport (no ScrollTrigger pin).
  // ScrollTrigger.pin wrapped the section in a pinSpacer div React didn't know
  // about, causing "Failed to execute 'removeChild'" crashes on route change.
  // Sticky positioning gives the same UX with no extra DOM wrappers.
  useEffect(() => {
    const section = hscrollRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;

    /* Size the section so total vertical scroll equals the track's horizontal
       overflow, plus one viewport for the initial pinned-feel. */
    const sizeSection = () => {
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = `${dist + window.innerHeight}px`;
    };
    sizeSection();
    window.addEventListener("resize", sizeSection);

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const n = PROJECTS.length;
            const i = Math.min(n - 1, Math.floor(self.progress * n));
            setActiveTick(i);
          },
        },
      });
    }, section);
    return () => {
      window.removeEventListener("resize", sizeSection);
      section.style.height = "";
      ctx.revert();
    };
  }, []);

  // Scroll-triggered split-reveal for below-the-fold data-split elements.
  useGSAP(() => {
    document
      .querySelectorAll<HTMLElement>(".interlude [data-split], .p-cta [data-split]")
      .forEach((el) => {
        const inners = el.querySelectorAll(".word > span");
        gsap.from(inners, {
          yPercent: 110,
          duration: 1.6,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
  });

  return (
    <DesignLayout>
      {/* HERO */}
      <section className="p-hero">
        <div className="p-hero-bg">
          <GridBg count={2} />
        </div>
        <div>
          <div className="p-label">02 / Projects &amp; blogs</div>
          <h1 data-split>
            <Word>Projects</Word> <Word>and</Word>{" "}
            <Word em>blogs.</Word>
          </h1>
          <div className="p-meta">
            <div className="lede">
              Bets on what software could feel like - built slowly, tested in
              production, written down honestly. Plus essays on the engineering
              ideas worth sharing.
            </div>
            <div>
              <span className="k">Format</span>
              <span className="v">Case studies + writing</span>
            </div>
            <div>
              <span className="k">Span</span>
              <span className="v">2024 - Now</span>
            </div>
            <div>
              <span className="k">Scroll</span>
              <span className="v">→ horizontal</span>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL SHOWCASE - sticky inner viewport, no ScrollTrigger pin
          (avoids the pinSpacer wrapper that confused React's commitDeletion). */}
      <section className="hscroll-section" ref={hscrollRef}>
        <div className="hscroll-sticky">
        <div className="hscroll-track" ref={trackRef}>
          <div className="hs-title">
            <div className="hs-tag">Section · 01</div>
            <h2>
              <em>Recent</em> work, slid sideways.
            </h2>
            <p className="hs-sub">
              Scroll vertically - the panels slide. {wordFor(PROJECTS.length).charAt(0).toUpperCase() + wordFor(PROJECTS.length).slice(1)}{" "}
              selected case studies.
            </p>
          </div>

          {PANELS.map((p) => (
            <article key={p.slug} className="panel">
              <span className="num">{p.num}</span>
              <span className="badge-y">{p.yearRange}</span>
              <div className="visual">
                <div className="thumb-ph">
                  <span>
                    {p.slug} · {p.yearRange}
                  </span>
                </div>
              </div>
              <div className="info">
                <div>
                  <h3>
                    {p.titleHead} <em>{p.titleEm}</em> {p.titleTail}
                  </h3>
                  <p>{p.short}</p>
                </div>
                <div className="right">
                  <div className="role">
                    {p.role}
                    <br />
                    {p.org}
                  </div>
                  <div className="tags">
                    {p.tech.slice(0, 3).map((t) => (
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
              That's the <em>{wordFor(PROJECTS.length)}.</em>
            </h3>
            <Btn to="/work">
              <span>See the experience</span>
              <span>→</span>
            </Btn>
          </div>
        </div>
        </div>

        <div className="hs-indicator">
          <span>
            {String(activeTick + 1).padStart(2, "0")} /{" "}
            {String(PROJECTS.length).padStart(2, "0")}
          </span>
          <div className="ticks">
            {PANELS.map((p, i) => (
              <div key={p.slug} className={`tick${i <= activeTick ? " is-active" : ""}`} />
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
          keep these case studies short on purpose - full writeups
          (architecture diagrams, decisions, post-mortems) are available on
          request.
        </p>
      </section>

      {/* STACKED CASE-STUDY CARDS */}
      <section className="stacks">
        {STACKS.map((s, i) => (
          <article
            key={s.slug}
            className="stack-item"
            style={{ top: `${8 + i * 3}vh`, zIndex: i + 1 }}
          >
            <div className="vis" data-image-in>
              <span className="corner">{s.case}</span>
              <div className="thumb-ph">
                <span>{s.slug}</span>
              </div>
            </div>
            <div className="txt">
              <div className="top">
                <span>{s.name}</span>
                <span>{s.yearRange}</span>
              </div>
              <div>
                <h3>
                  {s.titleHead} <em>{s.titleEm}</em> {s.titleTail}
                </h3>
                <p className="body">{s.long}</p>
                <div className="tags">
                  {s.tech.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
              <div className="links">
                {s.live && (
                  <a href={s.live} target="_blank" rel="noreferrer" data-magnet="0.2">
                    View live →
                  </a>
                )}
                <a href={s.repo} target="_blank" rel="noreferrer" data-magnet="0.2">
                  View source ↗
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* WRITING / BLOG */}
      <section className="writing-section">
        <div className="writing-head">
          <div className="writing-tag">04 / Writing</div>
          <h2>
            <em>Essays</em> &amp; deep dives.
          </h2>
          <p className="writing-sub">
            Notes from the agent build, an algorithmic curveball, and a peek
            inside Google's mono-repo. Published on Medium.
          </p>
        </div>
        <div className="writing-grid">
          {BLOGS.map((b) => (
            <a
              key={b.slug}
              className="blog-card"
              href={b.url}
              target="_blank"
              rel="noreferrer"
              data-magnet="0.06"
            >
              {b.cover && (
                <div className="blog-cover">
                  <img src={b.cover} alt="" loading="lazy" />
                </div>
              )}
              <div className="blog-meta">
                <span>{b.publication}</span>
                <span>
                  {b.date} · {b.readTime}
                </span>
              </div>
              <h3>
                {b.titleHead} <em>{b.titleEm}</em> {b.titleTail}
              </h3>
              <p>{b.summary}</p>
              <div className="blog-tags">
                {b.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <span className="blog-cta">Read on Medium ↗</span>
            </a>
          ))}
        </div>
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

  /* Horizontal scroll - sticky inner viewport (no ScrollTrigger pin) */
  .hscroll-section {
    width: 100%;
    position: relative; background: var(--bg);
  }
  .hscroll-sticky {
    position: sticky; top: 0;
    height: 100vh; width: 100%;
    overflow: hidden;
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
    position: fixed; right: 56px; bottom: 56px; z-index: 5;
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

  /* Writing / blog */
  .writing-section {
    padding: 0 56px 80px;
    max-width: var(--maxw); margin: 0 auto;
  }
  .writing-head {
    margin-bottom: 48px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .writing-tag {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
    display: flex; align-items: center; gap: 12px;
  }
  .writing-tag::before { content: ""; width: 32px; height: 1px; background: var(--ink); }
  .writing-head h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(40px, 6vw, 88px);
    line-height: 0.96; letter-spacing: -0.02em;
  }
  .writing-head h2 em { font-style: italic; color: var(--accent); }
  .writing-sub {
    font-family: var(--serif); font-style: italic;
    font-size: 18px; line-height: 1.5; color: var(--ink-2); max-width: 56ch;
  }
  .writing-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  .blog-card {
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--bg);
    display: flex; flex-direction: column;
    text-decoration: none; color: inherit;
    min-width: 0; overflow: hidden;
    transition: transform .4s var(--ease), border-color .3s var(--ease),
                box-shadow .4s var(--ease);
  }
  .blog-card:hover {
    transform: translateY(-4px);
    border-color: color-mix(in oklab, var(--ink) 30%, var(--line));
    box-shadow: 0 12px 28px rgba(22, 21, 19, 0.06);
  }
  .blog-cover {
    position: relative; width: 100%;
    aspect-ratio: 16 / 9; overflow: hidden;
    border-bottom: 1px solid var(--line);
    background: color-mix(in oklab, var(--ink) 4%, var(--bg));
  }
  .blog-cover img {
    width: 100%; height: 100%; display: block;
    object-fit: cover; object-position: center;
    transition: transform .6s var(--ease);
  }
  .blog-card:hover .blog-cover img { transform: scale(1.03); }
  .blog-card > .blog-meta { padding: 22px 22px 0; }
  .blog-card > h3 { padding: 0 22px; margin-top: 12px; }
  .blog-card > p { padding: 0 22px; margin-top: 12px; }
  .blog-card > .blog-tags { padding: 0 22px; margin-top: 14px; }
  .blog-card > .blog-cta { margin: 14px 0 0; padding: 14px 22px 22px; }
  .blog-meta {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 12px; flex-wrap: wrap;
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
  }
  .blog-card h3 {
    font-family: var(--serif); font-weight: 400;
    font-size: 24px; line-height: 1.15; letter-spacing: -0.01em;
    margin: 0;
  }
  .blog-card h3 em { font-style: italic; color: var(--accent); }
  .blog-card p {
    font-size: 13px; line-height: 1.6; color: var(--ink-2);
    flex: 1; margin: 0;
  }
  .blog-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .blog-cta {
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em;
    color: var(--ink); padding-top: 14px; margin-top: auto;
    border-top: 1px solid var(--line);
    transition: color .3s, padding-left .3s var(--ease);
  }
  .blog-card:hover .blog-cta { color: var(--accent); padding-left: 4px; }

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
    .p-hero h1 { font-size: clamp(56px, 12vw, 140px); }
    .hs-title { width: 80vw; }
    .panel { width: 78vw; }
    .hs-end { width: 60vw; }
  }
  @media (max-width: 900px) {
    .writing-section { padding: 0 24px 60px; }
    .writing-grid { grid-template-columns: 1fr; }
    .p-hero { padding: 130px 24px 60px; }
    .p-hero h1 { font-size: clamp(48px, 11vw, 96px); }
    .p-meta { grid-template-columns: 1fr 1fr; gap: 20px; }
    .interlude { padding: 80px 24px; grid-template-columns: 1fr; gap: 32px; }
    .interlude h2 { font-size: clamp(36px, 9vw, 64px); }
    .stacks { padding: 0 24px 80px; }
    .stack-item {
      grid-template-columns: 1fr; min-height: auto;
      position: static !important; margin-bottom: 24px;
    }
    .stack-item .vis { aspect-ratio: 16/10; border-right: none; border-bottom: 1px solid var(--line); }
    .stack-item .txt { padding: 28px; gap: 24px; }
    .stack-item .txt h3 { font-size: clamp(28px, 6vw, 44px); }
    .hscroll-section { height: auto !important; }
    .hscroll-sticky { position: static; height: auto; }
    .hscroll-track { flex-direction: column; padding: 0 24px; gap: 24px; }
    .hs-title, .hs-end, .panel { width: 100%; height: auto; }
    .hs-title h2 { font-size: clamp(48px, 12vw, 96px); }
    .panel { aspect-ratio: 4/5; }
    .panel .info h3 { font-size: 24px; }
    .hs-indicator { display: none; }
    .p-cta { padding: 64px 24px; }
    .p-cta h2 { font-size: clamp(36px, 10vw, 72px); }
  }
  @media (max-width: 600px) {
    .p-hero { padding: 140px 18px 40px; }
    .p-hero h1 { font-size: clamp(42px, 11vw, 72px); }
    .p-meta { grid-template-columns: 1fr; gap: 14px; }
    .p-meta .lede { font-size: 18px; }
    .interlude { padding: 60px 18px; }
    .stacks { padding: 0 18px 60px; }
    .stack-item .txt { padding: 22px; }
    .stack-item .txt .links { flex-wrap: wrap; gap: 16px; }
    .hscroll-track { padding: 0 18px; }
    .panel .info { grid-template-columns: 1fr; gap: 16px; padding: 20px; }
    .panel .info .right { align-items: flex-start; }
    .panel .info .tags { justify-content: flex-start; }
    .p-cta { padding: 56px 18px; }
  }
`;
