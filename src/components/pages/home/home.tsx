import React, { lazy, Suspense, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Btn,
  GridBg,
  Marquee,
  SectionTag,
  ShimmerBtn,
  BeamFrame,
  Word,
  Reveal,
  DesignLayout,
} from "../../design";
import { useDesignAnimations } from "../../../Hooks/useDesignAnimations";
import { usePersonalData } from "../../../context/PersonalDataContext";
/* Below-the-fold voice/RAG feature — split into its own chunk so the hero
   (LCP) isn't waiting on the sarvam + knowledge-base code to download. */
const VoiceAnalyzer = lazy(() =>
  import("../../Chat/VoiceAnalyzer").then((m) => ({ default: m.VoiceAnalyzer }))
);
import { useLenis } from "../../../App";
import { RouteSEO } from "../../seo/RouteSEO";
import { useSectionDwell } from "../../../Hooks/useSectionDwell";

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  const { heroTitle, heroStrip } = usePersonalData();
  const heroRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  useDesignAnimations();
  useSectionDwell("[data-section]");

  /* Scroll to a target id. Tries Lenis first, then a native fallback
     verified ~600ms later — if neither lands us inside +/-20px of the
     target we hard-jump there so the click never feels dead. */
  const scrollToTarget = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 40);
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2 });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
    window.setTimeout(() => {
      if (Math.abs(window.scrollY - target) > 24) {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    }, 700);
  };

  // Hero entrance timeline - scoped via useGSAP so StrictMode + remounts
  // never leave elements stuck in the from state.
  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { autoAlpha: 0, y: 12, duration: 1.1 }, 0)
        .from(".hero-name .word > span", { yPercent: 110, duration: 1.6, stagger: 0.12 }, 0.2)
        .from(".hero-tagline > *", { autoAlpha: 0, y: 18, duration: 1.2, stagger: 0.15 }, 1.2)
        .from(".hero-bottom > *", { autoAlpha: 0, duration: 1.4, stagger: 0.12, clearProps: "transform" }, 1.6);

      // Below-the-fold word reveals
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        const inners = el.querySelectorAll(".word > span");
        gsap.from(inners, {
          yPercent: 110,
          duration: 1.6,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope: heroRef }
  );

  const [first, ...rest] = heroTitle.name.split(" ");
  const lastName = rest.length ? rest.join(" ") : "";

  return (
    <DesignLayout>
      <RouteSEO
        title="Ketan Raj - Software Engineer | Emergent, ex-Google"
        description="Ketan Raj is a software engineer at Emergent (YC-backed) and ex-Google. Building agentic AI, intelligent backends, and developer-facing systems."
        path="/"
      />
      <section className="hero-section" ref={heroRef} data-section="hero">
        <div className="hero-grid-bg">
          <GridBg count={3} />
        </div>

        <div className="hero-eyebrow">
          <span className="ey-tag">Portfolio · 2026</span>
          <span className="ey-divider" />
          <span>{heroTitle.title || "Software Engineer"}</span>
          <span className="ey-divider" />
          <span>{heroTitle.location || "India"} · IST</span>
          <span className="ey-divider" />
          <span className="ey-google">
            ex&nbsp;
            <span className="g-mark" aria-label="Google">
              <span style={{ color: "#4285F4" }}>G</span>
              <span style={{ color: "#EA4335" }}>o</span>
              <span style={{ color: "#FBBC04" }}>o</span>
              <span style={{ color: "#4285F4" }}>g</span>
              <span style={{ color: "#34A853" }}>l</span>
              <span style={{ color: "#EA4335" }}>e</span>
            </span>
          </span>
        </div>

        <a
          href="#voice-feature"
          className="hero-agent-cta"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget("voice-feature");
          }}
          data-magnet="0.1"
        >
          <span className="agent-cta-dot" />
          <span className="agent-cta-pulse">NEW</span>
          <span className="agent-cta-rotator" aria-label="Talk to my AI agent">
            <span className="agent-cta-rline agent-cta-rline-0">Talk to my AI agent</span>
            <span className="agent-cta-rline agent-cta-rline-1">Ask about my work</span>
            <span className="agent-cta-rline agent-cta-rline-2">Hear about Origin</span>
            {/* Ghost line sets the width to the longest option to prevent jitter. */}
            <span className="agent-cta-ghost">Talk to my AI agent</span>
          </span>
          <span className="agent-cta-arrow">↓</span>
        </a>

        <h1 className="hero-name" aria-label={heroTitle.name}>
          <div className="row">
            <Word>{first}</Word>
            {lastName && <Word em>{lastName}.</Word>}
          </div>
        </h1>

        <div className="hero-tagline">
          <div className="tag-line">
            <span className="t-num">{heroStrip.taglineNum}</span>
            <span
              className="t-body"
              dangerouslySetInnerHTML={{ __html: heroStrip.taglineBody }}
            />
          </div>
          <div className="tag-actions">
            <Btn to="/projects" primary>
              <span>Selected work</span>
              <span>→</span>
            </Btn>
            <Btn to="/contact">
              <span>Start a project</span>
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
              <span className="k">Currently</span>
              <span className="v">
                <span className="led-inline" />
                SWE @ Emergent (YC24)
              </span>
            </div>
            <div>
              <span className="k">Focus</span>
              <span className="v">{heroStrip.focus}</span>
            </div>
          </div>

          <div className="hero-strip">
            {(["currently", "recent", "stack"] as const).map((key) => (
              <div className="col" key={key}>
                <h5>{key === "currently" ? "Currently" : key === "recent" ? "Recent" : "Stack"}</h5>
                <ul>
                  {heroStrip[key].map((item, i) => (
                    <li key={i}>
                      <span>{item.label}</span>
                      <span>{item.meta}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

      </section>

      <Marquee
        items={[
          "AI agents",
          "Agentic loops",
          "LLM orchestration",
          "RAG · Vector search",
          "Vertex AI · Google ADK",
          "Production backends",
          "Human-in-the-loop",
          "Tooling that ships",
        ]}
      />

      <section className="intro-section" data-section="intro" aria-labelledby="intro-heading">
        <SectionTag>Index · 01 / Intro</SectionTag>
        <div className="intro-grid">
          <h2 id="intro-heading" data-split>
            <Word>Engineer</Word> <Word>building</Word> <Word em>agentic</Word>{" "}
            <Word>AI.</Word>
          </h2>
          <div className="intro-body">
            <p>
              I'm Ketan Raj — a software engineer at{" "}
              <strong>Emergent (YC-backed)</strong> and previously at{" "}
              <strong>Google</strong>, where I shipped 18+ AI agent systems on
              Google ADK, FastAPI, and Vertex AI. I build agentic AI: planning
              loops, tool use, structured memory, and the human-in-the-loop
              safeguards that let agents run reliably in production.
            </p>
            <p>
              These days I'm building Emergent's product surface and{" "}
              <strong>Origin</strong>, an agentic hiring platform that reads the
              work you've actually shipped instead of your résumé. This site
              collects my projects, my writing on AI and engineering, and an AI
              agent — trained on my work — that you can talk to by voice or text.
            </p>
          </div>
        </div>
      </section>

      <section className="feature-section voice-section" id="voice-feature" data-section="voice-agent">
        <SectionTag>Index · 02 / Agent</SectionTag>

        <div className="feature-head">
          <h2 data-split>
            <Word>Meet</Word> <Word em>Ketan's</Word> <Word>assistant.</Word>
          </h2>
          <div className="feature-head-aside">
            An AI agent trained on Ketan's work - roles, projects, stack, writing.
            Voice or text. Anything personal, it sends you to /contact.
          </div>
        </div>

        <div className="voice-feature">
          <Suspense fallback={null}>
            <VoiceAnalyzer variant="feature" />
          </Suspense>
        </div>

        <div className="more-work-cta">
          <BeamFrame>
            <Btn to="/projects">
              <span>See the projects</span>
              <span>→</span>
            </Btn>
          </BeamFrame>
        </div>
      </section>

      <section className="cta-strip" data-section="cta-strip">
        <div className="cta-strip-bg">
          <GridBg count={2} />
        </div>
        <h2>
          <Word>Have</Word> <Word>an</Word> <Word>idea</Word>{" "}
          <Word>worth</Word> <Word em>building?</Word>
        </h2>
        <Reveal className="cta-actions">
          <ShimmerBtn to="/contact">
            Start a project ↗
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
  .hero-eyebrow .ey-google {
    display: inline-flex; align-items: center; gap: 1px;
    text-transform: none; letter-spacing: 0;
  }
  .hero-eyebrow .ey-google .g-mark {
    font-family: "Product Sans", "Google Sans", var(--sans);
    font-weight: 500; font-size: 18px; letter-spacing: -0.01em;
    text-transform: none; line-height: 1;
    display: inline-flex; align-items: baseline;
    margin-left: 2px;
  }
  .hero-eyebrow .ey-google .g-mark > span { display: inline-block; }

  .hero-name {
    margin: auto 0;
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(96px, 19vw, 320px);
    line-height: 0.9; letter-spacing: -0.04em;
    position: relative; z-index: 1;
    /* Crop the giant glyph spill so it can't visually crawl over the
       CTA above it — the cap-height of a 320px clamp font with
       line-height: 0.9 overshoots the box by ~32px without this. */
    padding-top: 0.05em;
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
    transform: translateZ(0);
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .hero-meta { transform: translateZ(0); }
  .hero-strip .col h5 {
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em;
    color: var(--muted); margin-bottom: 12px;
  }
  .hero-strip .col ul li {
    list-style: none; padding: 8px 0; font-size: 14px;
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 12px; flex-wrap: wrap;
    border-bottom: 1px dashed var(--line);
    line-height: 1.4;
  }
  .hero-strip .col ul li:last-child { border-bottom: none; }
  /* Direct children only - without ">", the :last-child rule was also
     matching the last letter span ("e") inside <GoogleMark/>, which sits
     inside the label, so the "e" was getting mono 11px and looked shrunk. */
  .hero-strip .col ul li > span:first-child { flex: 1; min-width: 0; }
  .hero-strip .col ul li > span:last-child {
    color: var(--muted); font-family: var(--mono); font-size: 11px;
    flex-shrink: 0; white-space: nowrap;
  }

  /* "Talk to my AI agent" attention CTA — outlined pill with a rotating
     animated-gradient list (Magic UI animated-list + animated-gradient-
     text combined). Pill is justify-self: start + width: fit-content
     so the hero grid doesn't stretch it across the whole row.
     position: relative + z-index above the hero h1 (z:2) because the
     h1's line-height: 0.9 lets its giant glyphs visually spill up into
     the CTA's grid cell, stealing clicks from the hit-test. */
  .hero-agent-cta {
    display: inline-flex; align-items: center; gap: 12px;
    width: fit-content; justify-self: start;
    margin-top: 18px; padding: 10px 18px 10px 14px;
    border: 1px solid var(--ink); border-radius: 999px;
    background: var(--bg); color: var(--ink); text-decoration: none;
    font-family: var(--mono); font-size: 11px; letter-spacing: .14em;
    text-transform: uppercase; cursor: pointer;
    position: relative; z-index: 6;
    transition: transform .35s var(--ease),
                box-shadow .35s var(--ease),
                background .35s var(--ease);
    box-shadow: 0 4px 0 0 color-mix(in oklab, var(--accent) 16%, transparent);
  }
  .hero-agent-cta:hover {
    transform: translateY(-2px);
    background: color-mix(in oklab, var(--accent) 6%, var(--bg));
    box-shadow: 0 6px 0 0 color-mix(in oklab, var(--accent) 28%, transparent),
                0 12px 28px color-mix(in oklab, var(--accent) 18%, transparent);
  }
  .agent-cta-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 22%, transparent);
    animation: pulse 1.8s infinite ease-in-out;
    flex-shrink: 0;
  }
  .agent-cta-pulse {
    padding: 3px 7px; border-radius: 4px;
    background: var(--ink); color: var(--bg);
    font-size: 9px; letter-spacing: .18em;
    animation: cta-flash 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes cta-flash {
    0%, 100% { background: var(--ink); }
    50%      { background: var(--accent); }
  }

  /* Rotating list — three lines, each visible for ~2s then slides up.
     Total cycle 6s, so each lineN is offset by 2s (33%). The ghost
     sets the container width to the longest line so the pill doesn't
     jitter as labels change. */
  .agent-cta-rotator {
    position: relative; display: inline-block; overflow: hidden;
    height: 1.2em; line-height: 1.2;
  }
  .agent-cta-ghost { visibility: hidden; white-space: nowrap; }
  .agent-cta-rline {
    position: absolute; left: 0; top: 0; white-space: nowrap;
    opacity: 0; transform: translateY(110%);
    /* Animated gradient text — Magic UI animated-gradient-text style. */
    background: linear-gradient(
      110deg,
      var(--ink) 0%,
      var(--accent) 35%,
      color-mix(in oklab, var(--accent) 70%, white) 50%,
      var(--accent) 65%,
      var(--ink) 100%
    );
    background-size: 220% 100%;
    background-clip: text; -webkit-background-clip: text;
    color: transparent; -webkit-text-fill-color: transparent;
  }
  .agent-cta-rline-0 { animation: cta-rotate 6s ease-in-out infinite 0s, cta-shine 3.5s linear infinite; }
  .agent-cta-rline-1 { animation: cta-rotate 6s ease-in-out infinite 2s, cta-shine 3.5s linear infinite; }
  .agent-cta-rline-2 { animation: cta-rotate 6s ease-in-out infinite 4s, cta-shine 3.5s linear infinite; }
  @keyframes cta-rotate {
    0%             { opacity: 0; transform: translateY(110%); }
    6%, 28%        { opacity: 1; transform: translateY(0); }
    34%, 100%      { opacity: 0; transform: translateY(-110%); }
  }
  @keyframes cta-shine {
    0%   { background-position: 220% 0; }
    100% { background-position: -220% 0; }
  }

  .agent-cta-arrow {
    font-family: var(--serif); font-size: 16px; letter-spacing: 0;
    color: var(--accent);
    animation: bob 1.6s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(4px); }
  }

  .intro-section { padding: 120px 56px 0; max-width: var(--maxw); margin: 0 auto; }
  .intro-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
    align-items: start; margin-top: 32px;
  }
  .intro-grid h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(40px, 5vw, 88px); line-height: 0.96; letter-spacing: -0.02em;
  }
  .intro-grid h2 em { font-style: italic; color: var(--accent); }
  .intro-body { display: flex; flex-direction: column; gap: 20px; }
  .intro-body p {
    font-size: 16px; line-height: 1.7; color: var(--ink-2); max-width: 56ch;
  }
  .intro-body strong { color: var(--ink); font-weight: 500; }

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
    .hero-name { font-size: clamp(64px, 15vw, 180px); }
    .hero-tagline { grid-template-columns: 1fr; gap: 24px; }
    .hero-tagline .tag-actions { justify-content: flex-start; }
  }
  @media (max-width: 900px) {
    .hero-section { padding: 130px 24px 60px; min-height: auto; }
    .intro-section { padding: 64px 24px 0; }
    .intro-grid { grid-template-columns: 1fr; gap: 24px; }
    .intro-grid h2 { font-size: clamp(32px, 9vw, 56px); }
    .feature-section { padding: 80px 24px 60px; }
    .hero-meta { grid-template-columns: 1fr 1fr; gap: 20px; }
    .hero-strip { grid-template-columns: 1fr; gap: 24px; }
    .feature-grid { grid-template-columns: 1fr; }
    .feature-head { flex-direction: column; align-items: flex-start; gap: 24px; }
    .feature-head h2 { font-size: clamp(40px, 12vw, 80px); }
    .feature-head-aside { text-align: left; }
    .cta-strip { padding: 64px 24px; margin-top: 40px; }
    .cta-strip h2 { font-size: clamp(40px, 12vw, 80px); }
  }
  @media (max-width: 600px) {
    .hero-section { padding: 140px 18px 40px; }
    .hero-agent-cta {
      margin-top: 14px; padding: 9px 14px 9px 12px; gap: 8px;
      font-size: 10px; letter-spacing: .12em;
      max-width: calc(100vw - 36px);
    }
    .agent-cta-dot { width: 6px; height: 6px; }
    .agent-cta-pulse { font-size: 8px; padding: 2px 6px; letter-spacing: .14em; }
    .agent-cta-arrow { font-size: 14px; }
    .agent-cta-rotator { height: 1.4em; }
    .voice-section .feature-head h2 { font-size: clamp(36px, 11vw, 64px); }
    .voice-section .feature-head-aside { font-size: 12px; }
    .hero-name { font-size: clamp(54px, 14vw, 96px); letter-spacing: -0.03em; }
    .hero-name .row { gap: 12px; }
    .hero-eyebrow { font-size: 9px; gap: 8px; flex-wrap: wrap; }
    .hero-eyebrow .ey-divider { width: 16px; }
    .hero-tagline { margin-top: 24px; padding-top: 24px; }
    .hero-tagline .t-body { font-size: 18px; }
    .hero-tagline .tag-actions { gap: 8px; }
    .hero-bottom { margin-top: 36px; }
    .hero-meta { grid-template-columns: 1fr; gap: 12px; padding: 16px 0; }
    .feature-section { padding: 60px 18px 40px; }
    .feature-card .img { aspect-ratio: 4/3; }
    .feature-card .info { padding: 20px; }
    .feature-card h3 { font-size: 24px; }
    .cta-strip { padding: 56px 18px; }
  }
`;

export default Home;
