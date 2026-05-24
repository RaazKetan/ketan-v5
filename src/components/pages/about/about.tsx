import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  DesignLayout,
  Marquee,
  Btn,
  ShimmerBtn,
  GridBg,
  Word,
} from "../../design";
import { useDesignAnimations } from "../../../Hooks/useDesignAnimations";
import { usePersonalData } from "../../../context/PersonalDataContext";
import BCImage from "../../../assets/BC.jpeg";
import HC1Image from "../../../assets/HC1.jpeg";
import HC2Image from "../../../assets/HC2.jpeg";
import meVideo from "../../../assets/me.mp4";

gsap.registerPlugin(ScrollTrigger);

export const About: React.FC = () => {
  const { contactInfo, bentoData } = usePersonalData();
  const { books: BOOKS, stack: STACK, soundtrack: SOUNDTRACK, gear: GEAR } = bentoData;
  const prologueRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useDesignAnimations();

  useGSAP(() => {
    gsap.from(".a-hero > div > *", {
      autoAlpha: 0,
      y: 24,
      duration: 1.2,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.15,
    });
  });

  /* Prologue scaling — ONE timeline scrubbed across the whole prologue
     section. The two-trigger version (entrance + exit) was getting confused
     by fast scrolls and reversals: each trigger lerped independently and
     they'd fight each other in the overlap region, sometimes leaving the
     text invisible. Single timeline = one progress value = no fight. */
  useGSAP(
    () => {
      const el = prologueRef.current;
      if (!el) return;
      const stage = el.querySelector<HTMLElement>(".stage");
      if (!stage) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 1,            // slight lerp; small enough to track fast scrolls
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        stage,
        { scale: 0.82, autoAlpha: 0, filter: "blur(6px)" },
        { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.35 }
      )
        // Hold at full scale + visible for the middle of the section.
        .to(stage, { scale: 1, autoAlpha: 1, duration: 0.30 })
        // Exit: scale up slightly + fade + blur out.
        .to(stage, {
          scale: 1.06,
          autoAlpha: 0,
          filter: "blur(8px)",
          duration: 0.35,
        });
    },
    { scope: prologueRef }
  );

  // Bento + pullquote split-reveal.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bento .b-tile", {
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".bento", start: "top 80%" },
      });
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
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
    return () => ctx.revert();
  }, []);

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <DesignLayout>
      {/* HERO */}
      <section className="a-hero">
        <div className="a-hero-bg">
          <GridBg count={2} />
        </div>
        <div>
          <div className="a-label">04 / About · the person, not the résumé</div>
          <h1>
            <span className="row">
              <Word>Hi,</Word> <Word>I'm</Word> <Word em>Ketan.</Word>
            </span>
            <span className="row">
              <Word>I</Word> <Word>build</Word> <Word>things</Word>{" "}
              <Word>slowly</Word>
            </span>
            <span className="row">
              <Word>and</Word> <Word em>on&nbsp;purpose.</Word>
              <span className="badge" data-magnet="">
                <span className="led" />
                {contactInfo.locationShort} · IST
              </span>
            </span>
          </h1>

          <div className="a-meta">
            <div className="lede">
              This page isn't a résumé — that's{" "}
              <Link to="/work">over here</Link>. This is the slower stuff: where
              I live, what I'm reading, the things I'm thinking about, and the
              small picture of a much longer story.
            </div>
            <div className="col">
              <h6>From</h6>
              <p>Gaya, Bihar</p>
            </div>
            <div className="col">
              <h6>Mother tongues</h6>
              <p>HI, EN · learning DE</p>
            </div>
            <div className="col">
              <h6>Currently</h6>
              <p>Bengaluru · IST</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROLOGUE */}
      <section className="prologue" ref={prologueRef}>
        <div className="prologue-pin">
          <div className="stage">
            <h2>
              Most of life is <em>not</em> the highlight reel.
              <br />
              It's the long quiet middle —<br />
              the part where the <em>real</em> work happens.
            </h2>
            <div className="credit">— a thing I keep coming back to</div>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <section className="bento">
        {/* Portrait */}
        <div className="b-tile b-portrait" data-image-in>
          <span className="corner">Portrait</span>
          <span className="corner right">02:46</span>
          <img src={BCImage} alt="Portrait" />
        </div>

        {/* Statement */}
        <div className="b-tile b-statement">
          <div className="body">
            <div>
              <h6>Statement</h6>
              <div className="xl">
                I build software that <em>disappears</em> — calm interfaces,
                predictable systems, tools that respect the people using them.
              </div>
            </div>
            <p>
              I grew up helping run a small family business — learned early
              that constraints create creativity. Today I apply the same
              thinking to software: limited time, limited compute, limited
              attention. Build clean systems within constraints.
            </p>
          </div>
        </div>

        {/* Location / map */}
        <div className="b-tile b-loc">
          <span className="corner">Location</span>
          <div className="map" />
          <div className="pin" />
          <div className="body">
            <h6>{contactInfo.locationShort}</h6>
            <div className="loc-line">{contactInfo.locationLong.split(", ").pop()} · IST.</div>
          </div>
          <span className="lcoord">{contactInfo.coords.lat} · {contactInfo.coords.lon}</span>
        </div>

        {/* Now */}
        <div className="b-tile b-now">
          <div className="body">
            <div>
              <h6>
                <span className="pulse" />
                Right now
              </h6>
              <div className="lg" style={{ marginTop: 8 }}>
                Filter coffee in hand. Sketching an <em>agent</em> orchestration
                spec.
              </div>
            </div>
            <p>Updated 06 min ago · auto</p>
          </div>
        </div>

        {/* Photo A */}
        <div className="b-tile b-photo-a" data-image-in>
          <span className="corner">Hackathon · win</span>
          <img src={HC1Image} alt="Hackathon" />
        </div>

        {/* Philosophy */}
        <div className="b-tile b-philo">
          <div className="body" style={{ padding: 0 }}>
            <div>
              <h6>How I think about the craft</h6>
              <div className="lg" style={{ marginTop: 12 }}>
                Software is mostly <em>typography</em> and time.
                <br />
                Latency is a feature. The best abstraction is the one you delete.
              </div>
            </div>
            <p style={{ marginTop: 16 }}>
              Think in systems, not features. Complexity is a design smell. If a
              task is done twice manually, it should be code. Depth over trends.
            </p>
          </div>
        </div>

        {/* Video */}
        <div className="b-tile b-video" data-image-in>
          <div className="title-overlay">Showreel · live</div>
          <div className="video-frame">
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              src={meVideo}
            />
          </div>
          <div className="controls">
            <button type="button" className="play" onClick={toggleVideo}>
              {playing ? "Pause ❚❚" : "Play ▶"}
            </button>
            <span>Reel · 2024</span>
          </div>
        </div>

        {/* Music / now playing */}
        <div className="b-tile b-music">
          <div>
            <h6>
              <span className="pulse" />
              Now playing
            </h6>
            <div className="lg" style={{ marginTop: 8 }}>
              Lofi for late commits — <em>monsoon mix vol. 4.</em>
            </div>
          </div>
          <div>
            <div className="eq" aria-hidden>
              <span /><span /><span /><span />
              <span /><span /><span /><span />
            </div>
            <p style={{ marginTop: 16 }}>3'42" / 7'18" · headphones on</p>
          </div>
        </div>

        {/* Photo B */}
        <div className="b-tile b-photo-b" data-image-in>
          <span className="corner">Speaking</span>
          <img src={HC2Image} alt="Public speaking" />
        </div>

        {/* Books */}
        <div className="b-tile b-books">
          <div>
            <h6>Bookshelf, current row</h6>
            <ul>
              {BOOKS.map((b) => (
                <li key={b.title}>
                  <em>{b.title}</em> · {b.author} &nbsp;
                  <span className="y">{b.year}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stack */}
        <div className="b-tile b-stack">
          <div>
            <h6>Most-used, this season</h6>
            <ul>
              {STACK.map((s) => (
                <li key={s.name}>
                  <span>{s.name}</span>
                  <span>{s.pct}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Soundtrack */}
        <div className="b-tile b-soundtrack">
          <div>
            <h6>Tonight's queue</h6>
            {SOUNDTRACK.map((t) => (
              <div key={t.title} className="track">
                <div className="art">
                  <span className="glyph" />
                </div>
                <div>
                  <div className="t">{t.title}</div>
                  <div className="a">{t.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood images */}
        <div className="b-tile b-mood-1" data-image-in>
          <span className="corner">Workspace</span>
          <img src={BCImage} alt="Workspace" />
        </div>
        <div className="b-tile b-mood-2" data-image-in>
          <span className="corner">Notebook</span>
          <img src={HC1Image} alt="Notebook" />
        </div>
        <div className="b-tile b-mood-3" data-image-in>
          <span className="corner">Field</span>
          <img src={HC2Image} alt="Field" />
        </div>
      </section>

      {/* Pull quote */}
      <section className="a-pullquote">
        <q data-split>
          <Word>Pay</Word> <Word>the</Word> <Word em>boring</Word>{" "}
          <Word>debts</Word> <Word>first.</Word>
          <br />
          <Word>The</Word> <Word>user's</Word> <Word>loading</Word>{" "}
          <Word>spinner</Word> <Word>is</Word> <Word>your</Word>{" "}
          <Word>résumé.</Word>
        </q>
        <div className="attr">— from a margin in a notebook</div>
      </section>

      {/* Workspace */}
      <section className="workspace">
        <div>
          <h2 data-split>
            <Word>The</Word> <Word em>workshop.</Word>
          </h2>
          <p className="sub">
            A small desk by a tall window. Mechanical keyboard, filter coffee
            brewing, a notebook always open. The tools I reach for, daily.
          </p>
        </div>
        <div>
          <ul className="gear">
            {GEAR.map((g) => (
              <li key={g.name}>
                <span className="nm">{g.name}</span>
                <span className="ds">{g.ds}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Marquee
        items={[
          "quiet software",
          "slow productivity",
          "small teams",
          "long walks",
          "good defaults",
          "sharp tools",
          "no slop",
          "fewer features",
        ]}
      />

      {/* Outro CTA */}
      <section className="a-cta">
        <div className="a-cta-bg">
          <GridBg count={3} />
        </div>
        <h2>
          <Word>Now,</Word> <Word>let's</Word> <Word em>talk.</Word>
        </h2>
        <div className="a-cta-actions">
          <ShimmerBtn to="/contact">Start a project ↗</ShimmerBtn>
          <Btn to="/projects">
            <span>See the work</span>
            <span>→</span>
          </Btn>
        </div>
      </section>

      <style>{styles}</style>
    </DesignLayout>
  );
};

const styles = `
  /* HERO */
  .a-hero {
    min-height: 92vh; padding: 160px 56px 80px;
    max-width: var(--maxw); margin: 0 auto;
    display: grid; align-items: end; position: relative;
  }
  .a-hero-bg { position: absolute; inset: 0; opacity: .35; }
  .a-label {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; margin-bottom: 32px;
    display: flex; align-items: center; gap: 12px;
  }
  .a-label::before { content: ""; width: 32px; height: 1px; background: var(--ink); }
  .a-hero h1 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(80px, 14vw, 240px);
    line-height: 0.88; letter-spacing: -0.03em;
  }
  .a-hero h1 em { font-style: italic; color: var(--accent); }
  .a-hero h1 .row { display: flex; align-items: baseline; gap: 32px; flex-wrap: wrap; }
  .a-hero h1 .badge {
    font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: .14em;
    border: 1px solid var(--ink); border-radius: 999px;
    padding: 10px 16px; line-height: 1; align-self: center;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .a-hero h1 .badge .led {
    width: 6px; height: 6px; border-radius: 50%;
    background: #2a9b6f; box-shadow: 0 0 8px #2a9b6f;
  }
  .a-meta {
    margin-top: 56px; padding-top: 32px;
    border-top: 1px solid var(--line);
    display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 32px;
  }
  .a-meta .lede {
    font-family: var(--serif); font-style: italic;
    font-size: 22px; line-height: 1.4; color: var(--ink-2); max-width: 42ch;
  }
  .a-meta .lede a {
    text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px;
  }
  .a-meta .col h6 {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; margin-bottom: 8px;
  }
  .a-meta .col p { font-family: var(--mono); font-size: 12px; color: var(--ink); }

  /* PROLOGUE */
  .prologue { height: 220vh; position: relative; padding: 0; }
  .prologue-pin {
    position: sticky; top: 0; height: 100vh;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .prologue-pin .stage {
    text-align: center; padding: 0 6vw; max-width: 1600px;
    transform: scale(1); will-change: transform, opacity;
  }
  .prologue-pin h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 8vw, 140px); line-height: 1.0;
    letter-spacing: -0.02em;
  }
  .prologue-pin h2 em { font-style: italic; color: var(--accent); }
  .prologue-pin .credit {
    margin-top: 32px;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
  }

  /* BENTO */
  .bento {
    padding: 120px 56px; max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-columns: repeat(6, 1fr); grid-auto-rows: 180px;
    gap: 16px;
  }
  .b-tile {
    background: var(--bg); border: 1px solid var(--line); border-radius: 8px;
    position: relative; overflow: hidden;
    transition: transform .5s var(--ease), border-color .3s var(--ease);
    display: flex; flex-direction: column;
  }
  .b-tile:hover { transform: translateY(-3px); border-color: color-mix(in oklab, var(--ink) 30%, var(--line)); }
  .b-tile .corner {
    position: absolute; left: 16px; top: 16px; z-index: 2;
    font-family: var(--mono); font-size: 10px; letter-spacing: .14em;
    color: var(--muted); text-transform: uppercase;
    background: var(--bg); padding: 5px 9px;
    border: 1px solid var(--line); border-radius: 2px;
  }
  .b-tile .corner.right { left: auto; right: 16px; }
  .b-tile .body {
    padding: 24px; display: flex; flex-direction: column;
    justify-content: space-between; height: 100%;
    position: relative; z-index: 2;
  }
  .b-tile .lg {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(32px, 3vw, 48px); line-height: 1.05; letter-spacing: -0.01em;
  }
  .b-tile .lg em { font-style: italic; color: var(--accent); }
  .b-tile .xl {
    font-family: var(--serif); font-size: clamp(48px, 5vw, 80px);
    line-height: 0.95; letter-spacing: -0.02em; font-weight: 400;
  }
  .b-tile .xl em { font-style: italic; color: var(--accent); }
  .b-tile p { font-size: 13px; line-height: 1.55; color: var(--ink-2); }
  .b-tile h6 {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .b-tile h6 .pulse {
    width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-soft);
    animation: pulse 2s infinite;
  }
  .b-tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }

  /* Sizes */
  .b-portrait { grid-column: span 2; grid-row: span 3; padding: 0; }
  .b-statement { grid-column: span 4; grid-row: span 3; padding: 40px; }
  .b-statement .body { padding: 0; flex: 1; }
  .b-loc { grid-column: span 2; grid-row: span 1; padding: 0; }
  .b-now { grid-column: span 2; grid-row: span 1; }
  .b-photo-a { grid-column: span 2; grid-row: span 2; padding: 0; }
  .b-philo { grid-column: span 4; grid-row: span 2; padding: 32px; }
  .b-video { grid-column: span 3; grid-row: span 2; padding: 0; }
  .b-music { grid-column: span 3; grid-row: span 2; padding: 24px; display: flex; justify-content: space-between; }
  .b-photo-b { grid-column: span 2; grid-row: span 2; padding: 0; }
  .b-books { grid-column: span 2; grid-row: span 2; padding: 24px; }
  .b-stack { grid-column: span 3; grid-row: span 2; padding: 24px; }
  .b-soundtrack { grid-column: span 3; grid-row: span 2; padding: 24px; }
  .b-mood-1, .b-mood-2, .b-mood-3 { grid-column: span 2; grid-row: span 2; padding: 0; }

  /* Video tile */
  .b-video .video-frame {
    position: absolute; inset: 0; background: #0c0c0c;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .b-video video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .b-video .controls {
    position: absolute; left: 16px; right: 16px; bottom: 16px;
    display: flex; justify-content: space-between; align-items: flex-end;
    color: rgba(255, 255, 255, 0.85); z-index: 3;
    font-family: var(--mono); font-size: 10px; letter-spacing: .14em;
    text-transform: uppercase;
  }
  .b-video .play {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--bg); color: var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 11px; letter-spacing: .14em;
    cursor: pointer; border: 0;
    transition: transform .3s var(--ease);
  }
  .b-video .play:hover { transform: scale(1.05); }
  .b-video .title-overlay {
    position: absolute; left: 16px; top: 16px; z-index: 3;
    color: rgba(255, 255, 255, 0.85);
    font-family: var(--mono); font-size: 10px; letter-spacing: .14em;
    text-transform: uppercase;
  }

  /* Stack list */
  .b-stack ul { list-style: none; display: flex; flex-direction: column; gap: 4px; margin-top: 12px; padding: 0; }
  .b-stack ul li {
    font-size: 14px; color: var(--ink-2);
    display: flex; justify-content: space-between;
    padding: 6px 0; border-bottom: 1px dashed var(--line);
  }
  .b-stack ul li:last-child { border: none; }
  .b-stack ul li span:last-child {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
  }

  /* Books */
  .b-books ul { list-style: none; display: flex; flex-direction: column; gap: 6px; margin-top: 12px; padding: 0; }
  .b-books ul li {
    font-family: var(--serif); font-size: 15px; line-height: 1.3; color: var(--ink-2); padding: 4px 0;
  }
  .b-books ul li em { font-style: italic; color: var(--accent); }
  .b-books ul li .y { font-family: var(--mono); font-size: 9px; color: var(--muted); letter-spacing: .12em; }

  /* Soundtrack */
  .b-soundtrack .track {
    display: flex; align-items: center; gap: 14px; margin-top: 14px;
    padding: 8px 0; border-bottom: 1px dashed var(--line);
  }
  .b-soundtrack .track:last-child { border-bottom: none; }
  .b-soundtrack .track .art {
    width: 36px; height: 36px; border-radius: 4px; flex: 0 0 auto;
    background: var(--bg-deep); border: 1px solid var(--line);
    display: flex; align-items: center; justify-content: center;
  }
  .b-soundtrack .track .art .glyph {
    width: 10px; height: 10px; background: var(--accent); border-radius: 50%;
  }
  .b-soundtrack .track .t { font-family: var(--serif); font-size: 16px; line-height: 1.2; }
  .b-soundtrack .track .t em { font-style: italic; color: var(--accent); }
  .b-soundtrack .track .a {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
  }

  /* Music EQ */
  .b-music .eq { display: flex; align-items: flex-end; gap: 3px; height: 28px; margin-top: 12px; }
  .b-music .eq span {
    display: block; width: 3px; background: var(--accent); border-radius: 1px;
    animation: bars 1.2s ease-in-out infinite;
  }
  .b-music .eq span:nth-child(1) { animation-delay: 0s; height: 30%; }
  .b-music .eq span:nth-child(2) { animation-delay: .1s; height: 70%; }
  .b-music .eq span:nth-child(3) { animation-delay: .2s; height: 50%; }
  .b-music .eq span:nth-child(4) { animation-delay: .3s; height: 90%; }
  .b-music .eq span:nth-child(5) { animation-delay: .4s; height: 60%; }
  .b-music .eq span:nth-child(6) { animation-delay: .15s; height: 40%; }
  .b-music .eq span:nth-child(7) { animation-delay: .25s; height: 80%; }
  .b-music .eq span:nth-child(8) { animation-delay: .35s; height: 55%; }
  @keyframes bars {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(.4); transform-origin: bottom; }
  }

  /* Location map */
  .b-loc .map {
    position: absolute; inset: 0; overflow: hidden;
    background:
      radial-gradient(circle at 50% 65%, color-mix(in oklab, var(--accent) 50%, transparent) 0 6px, transparent 7px),
      radial-gradient(circle at 50% 65%, color-mix(in oklab, var(--accent) 22%, transparent) 0 22px, transparent 24px),
      radial-gradient(circle at 50% 65%, color-mix(in oklab, var(--accent) 12%, transparent) 0 56px, transparent 58px);
  }
  .b-loc .map::before {
    content: ""; position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size: 28px 28px;
    -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
            mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
    opacity: .6;
  }
  .b-loc .pin {
    position: absolute; left: 50%; top: 65%;
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--accent); transform: translate(-50%, -50%);
    box-shadow: 0 0 0 6px var(--accent-soft);
    animation: pulse 2s infinite;
    z-index: 2;
  }
  .b-loc .body { padding: 16px; pointer-events: none; position: relative; z-index: 2; height: 100%; }
  .b-loc .loc-line { font-family: var(--serif); font-size: 22px; line-height: 1.15; }
  .b-loc .lcoord {
    position: absolute; right: 12px; bottom: 12px; z-index: 2;
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .12em;
    background: var(--bg); padding: 4px 8px; border: 1px solid var(--line); border-radius: 2px;
  }

  /* Pull quote */
  .a-pullquote {
    padding: 120px 56px; max-width: var(--maxw); margin: 0 auto;
    text-align: center; position: relative;
  }
  .a-pullquote q {
    font-family: var(--serif); font-style: italic;
    font-size: clamp(40px, 5vw, 80px); line-height: 1.15;
    letter-spacing: -0.01em; quotes: none;
  }
  .a-pullquote q em { color: var(--accent); }
  .a-pullquote .attr {
    margin-top: 32px;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
  }

  /* Workspace */
  .workspace {
    padding: 80px 56px 120px; max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1.6fr; gap: 64px; align-items: end;
  }
  .workspace h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(40px, 5vw, 72px); line-height: 1.0; letter-spacing: -0.02em;
  }
  .workspace h2 em { font-style: italic; color: var(--accent); }
  .workspace .sub {
    font-family: var(--serif); font-style: italic;
    font-size: 20px; line-height: 1.4; color: var(--ink-2);
    margin-top: 20px; max-width: 36ch;
  }
  .workspace .gear {
    list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    border-top: 1px solid var(--line); padding: 0;
  }
  .workspace .gear li {
    display: grid; grid-template-columns: 1fr auto; gap: 16px;
    padding: 16px 0; border-bottom: 1px solid var(--line);
    align-items: baseline;
  }
  .workspace .gear li:nth-child(odd) { padding-right: 24px; border-right: 1px solid var(--line); }
  .workspace .gear li:nth-child(even) { padding-left: 24px; }
  .workspace .gear li .nm { font-family: var(--serif); font-size: 18px; }
  .workspace .gear li .ds {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .12em;
  }

  /* CTA */
  .a-cta {
    padding: 96px 56px; border-top: 1px solid var(--line);
    position: relative; overflow: hidden;
    max-width: var(--maxw); margin: 0 auto;
  }
  .a-cta-bg { position: absolute; inset: 0; opacity: .5; }
  .a-cta h2 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 8vw, 140px); line-height: 0.92; letter-spacing: -0.03em;
    text-align: center; position: relative;
  }
  .a-cta h2 em { font-style: italic; color: var(--accent); }
  .a-cta-actions {
    margin-top: 48px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    position: relative;
  }

  @media (max-width: 1100px) {
    .a-hero h1 { font-size: clamp(56px, 12vw, 140px); }
    .bento { grid-template-columns: repeat(4, 1fr); grid-auto-rows: 160px; }
    .b-portrait { grid-column: span 2; grid-row: span 3; }
    .b-statement { grid-column: span 2; grid-row: span 3; padding: 24px; }
    .b-loc, .b-now { grid-column: span 2; grid-row: span 1; }
    .b-photo-a, .b-photo-b { grid-column: span 2; grid-row: span 2; }
    .b-philo, .b-video, .b-music, .b-books, .b-stack, .b-soundtrack { grid-column: span 4; grid-row: span 2; }
    .b-mood-1, .b-mood-2, .b-mood-3 { grid-column: span 2; grid-row: span 2; }
    .a-meta { grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .a-meta .lede { grid-column: span 3; }
  }
  @media (max-width: 900px) {
    .about-section { padding: 0 24px; }
    .a-hero { padding: 130px 24px 60px; }
    .a-hero h1 { font-size: clamp(48px, 11vw, 96px); }
    .a-hero h1 .row { gap: 16px; }
    .a-hero h1 .badge { font-size: 10px; padding: 8px 12px; }
    .a-meta { margin-top: 32px; padding-top: 24px; grid-template-columns: 1fr 1fr; gap: 16px; }
    .a-meta .lede { grid-column: span 2; font-size: 18px; }
    .prologue { height: 180vh; margin: 40px 0; }
    .prologue-pin h2 { font-size: clamp(32px, 7vw, 56px); }
    .pullquote { padding: 100px 24px; }
    .ambition { padding-top: 80px; }
    .ambition-grid { grid-template-columns: 1fr; gap: 24px; }
  }
  @media (max-width: 700px) {
    .a-hero { padding: 140px 18px 40px; }
    .a-hero h1 { font-size: clamp(42px, 11vw, 72px); }
    .a-hero h1 .row { gap: 10px; }
    .a-hero h1 .badge {
      font-size: 9px; padding: 6px 10px;
      margin-top: 12px;
    }
    .a-meta { grid-template-columns: 1fr; gap: 12px; }
    .a-meta .lede { grid-column: span 1; font-size: 16px; }
    .prologue { height: 160vh; }
    .prologue-pin h2 { font-size: clamp(26px, 8vw, 48px); padding: 0 18px; }
    .bento { padding: 60px 18px; grid-template-columns: 1fr; grid-auto-rows: minmax(180px, auto); gap: 12px; }
    .bento > .b-tile { grid-column: span 1 !important; grid-row: span 1 !important; min-height: 220px; }
    .b-statement { padding: 20px !important; }
    .b-statement .xl { font-size: 28px; }
    .b-philo .lg, .b-now .lg { font-size: 22px; }
    .a-pullquote { padding: 60px 18px; }
    .a-pullquote q { font-size: clamp(28px, 9vw, 44px); }
    .workspace { padding: 40px 18px 80px; grid-template-columns: 1fr; gap: 32px; }
    .workspace h2 { font-size: clamp(32px, 10vw, 56px); }
    .workspace .gear { grid-template-columns: 1fr; }
    .workspace .gear li:nth-child(odd) { padding-right: 0; border-right: none; }
    .workspace .gear li:nth-child(even) { padding-left: 0; }
    .a-cta { padding: 56px 18px; }
    .a-cta h2 { font-size: clamp(36px, 12vw, 72px); }
  }
`;
