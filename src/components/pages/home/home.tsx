import React, { useRef } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Btn,
  GridBg,
  Marquee,
  ShimmerBtn,
  BeamFrame,
  Word,
  Reveal,
  DesignLayout,
} from "@/components/design";
import { useDesignAnimations } from "@/Hooks/useDesignAnimations";
import { usePersonalData } from "@/context/PersonalDataContext";
/* Below-the-fold voice/RAG feature — split into its own chunk so the hero
   (LCP) isn't waiting on the sarvam + knowledge-base code to download. */
import { RouteSEO } from "@/components/seo/RouteSEO";
import { useSectionDwell } from "@/Hooks/useSectionDwell";

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  const { heroTitle, heroStrip } = usePersonalData();
  const heroRef = useRef<HTMLElement>(null);
  useDesignAnimations();
  useSectionDwell("[data-section]");


  // Hero entrance timeline - scoped via useGSAP so StrictMode + remounts
  // never leave elements stuck in the from state.
  useGSAP(
    () => {
      /* No leading delay and the headline (the LCP element) reveals first and
         fast, so it paints ~1s sooner than before — the rest staggers in after.
         Slow first paint was the main bounce driver. */
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-name .word > span", { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0)
        .from(".hero-eyebrow", { autoAlpha: 0, y: 12, duration: 0.7 }, 0.1)
        .from(".hero-tagline > *", { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.4)
        .from(".hero-bottom > *", { autoAlpha: 0, duration: 1.0, stagger: 0.1, clearProps: "transform" }, 0.6);

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

      <section className="feature-section" data-section="work-cta">
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
