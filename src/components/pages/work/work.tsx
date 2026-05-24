import React, { useEffect, useRef, useState } from "react";
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
import { usePersonalData } from "../../../context/PersonalDataContext";
import type { Experience } from "../../../data/experience";

gsap.registerPlugin(ScrollTrigger);

const NUMBER_WORDS: Record<number, string> = {
  1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
  6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten",
};

export const Work: React.FC = () => {
  const { experience: EXPERIENCE, workInfo } = usePersonalData();
  const [openSlug, setOpenSlug] = useState<string | null>(EXPERIENCE[0]?.slug ?? null);
  useDesignAnimations();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });
      tl.from(".ds-nav", { autoAlpha: 0, y: -16, duration: 1.1 }, 0)
        .from(".w-label", { autoAlpha: 0, y: 18, duration: 1.1 }, 0.2)
        .from(".w-hero h1 .word > span", { yPercent: 110, duration: 1.6, stagger: 0.12 }, 0.4)
        .from(".w-lede > *", { autoAlpha: 0, y: 18, duration: 1.2, stagger: 0.15 }, 1.4);

      gsap.from(".w-stats .stat", {
        autoAlpha: 0,
        duration: 1.3,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".w-stats", start: "top 90%" },
      });

      gsap.from(".w-exp-item", {
        autoAlpha: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".w-experience", start: "top 80%" },
      });
    });
    return () => ctx.revert();
  }, []);

  /* Years of shipping — driven by workInfo.shippingStartYear in PersonalDataContext. */
  const totalYears = new Date().getFullYear() - workInfo.shippingStartYear;

  return (
    <DesignLayout>
      <section className="w-hero">
        <div className="w-hero-bg">
          <GridBg count={3} />
        </div>
        <div>
          <div className="w-label">03 / Work · experience</div>
          <h1 data-split>
            <Word>{NUMBER_WORDS[totalYears] ?? String(totalYears)}</Word>{" "}
            <Word em>years</Word> <Word>of</Word> <Word>shipping.</Word>
          </h1>
          <div className="w-lede">
            <div className="l">{workInfo.ledeShort}</div>
            <div className="r">{workInfo.ledeLong}</div>
          </div>
        </div>
      </section>

      <div className="w-stats">
        <div className="stat">
          <div className="num">
            <NumberTicker value={totalYears} />
            <span className="suffix">yrs</span>
          </div>
          <div className="lbl">Years shipping software</div>
        </div>
        <div className="stat">
          <div className="num">
            <NumberTicker value={EXPERIENCE.length} />
            <span className="suffix">·</span>
          </div>
          <div className="lbl">Roles &amp; stints</div>
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
            <NumberTicker value={6} />
            <span className="suffix">×</span>
          </div>
          <div className="lbl">Deep case studies</div>
        </div>
      </div>

      <section className="w-experience">
        <div className="row-head">
          <div>№</div>
          <div>Role &amp; Company</div>
          <div>Location</div>
          <div>Year</div>
          <div />
        </div>

        {EXPERIENCE.map((exp, i) => (
          <ExperienceRow
            key={exp.slug}
            exp={exp}
            index={i}
            isOpen={openSlug === exp.slug}
            onToggle={() =>
              setOpenSlug((cur) => (cur === exp.slug ? null : exp.slug))
            }
          />
        ))}
      </section>

      <section className="w-cta">
        <div className="w-cta-bg">
          <GridBg count={3} />
        </div>
        <h2>
          <Word>{workInfo.ctaHeadline[0]}</Word>{" "}
          <Word em>{workInfo.ctaHeadline[1]}</Word>{" "}
          <Word>{workInfo.ctaHeadline[2]}</Word>
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

const ExperienceRow: React.FC<{
  exp: Experience;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ exp, index, isOpen, onToggle }) => {
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = detailRef.current;
    if (!el) return;
    if (isOpen) {
      gsap.fromTo(
        el,
        { height: 0, autoAlpha: 0 },
        {
          height: "auto",
          autoAlpha: 1,
          duration: 0.55,
          ease: "power3.out",
        }
      );
    } else {
      gsap.to(el, {
        height: 0,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power3.in",
      });
    }
  }, [isOpen]);

  return (
    <div className={`w-exp-item${isOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="w-exp-row"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`exp-${exp.slug}`}
        data-magnet="0.04"
      >
        <span className="idx">{String(index + 1).padStart(2, "0")}</span>
        <div className="role">
          <span className="role-line">
            <span className="r-title">{exp.role}</span>
            <span className="r-at"> · </span>
            <em>{exp.company}</em>
          </span>
          <span className="r-sum">{exp.summary}</span>
        </div>
        <span className="loc">{exp.location}</span>
        <span className="year">{exp.year}</span>
        <span className="toggle" aria-hidden>
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div
        id={`exp-${exp.slug}`}
        ref={detailRef}
        className="w-exp-detail"
        style={{ height: 0, opacity: 0, overflow: "hidden" }}
      >
        <div className="w-exp-detail-inner">
          <div className="detail-meta">
            <div>
              <span className="k">Period</span>
              <span className="v">
                {exp.yearStart} — {exp.yearEnd}
              </span>
            </div>
            <div>
              <span className="k">Location</span>
              <span className="v">{exp.location}</span>
            </div>
            <div className="stack-cell">
              <span className="k">Stack</span>
              <div className="v">
                {exp.stack.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </div>
          </div>
          <ul className="bullets">
            {exp.bullets.map((b, i) => (
              <li key={i}>
                <span className="dot" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {exp.link && (
            <a
              href={exp.link}
              target="_blank"
              rel="noreferrer"
              className="detail-link"
            >
              Read more →
            </a>
          )}
        </div>
      </div>
    </div>
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

  /* Experience accordion */
  .w-experience { padding: 0 56px 160px; max-width: var(--maxw); margin: 0 auto; }
  .row-head {
    display: grid;
    grid-template-columns: 60px 1.8fr 1fr 120px 40px;
    gap: 32px; padding: 16px 0; border-bottom: 1px solid var(--ink);
    font-family: var(--mono); font-size: 10px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--muted);
  }
  .w-exp-item {
    border-bottom: 1px solid var(--line);
    transition: background .35s var(--ease);
  }
  .w-exp-item.is-open { background: color-mix(in oklab, var(--accent) 5%, transparent); }
  .w-exp-row {
    display: grid;
    grid-template-columns: 60px 1.8fr 1fr 120px 40px;
    gap: 32px; padding: 28px 0;
    align-items: center;
    width: 100%; background: transparent; border: 0;
    font: inherit; color: inherit; text-align: left;
    cursor: pointer;
    position: relative; overflow: hidden;
    transition: padding .4s var(--ease);
  }
  .w-exp-row:hover { padding-left: 12px; }
  .w-exp-row::after {
    content: ""; position: absolute; left: 0; bottom: 0; height: 1px;
    width: 0; background: var(--accent); transition: width .6s var(--ease);
  }
  .w-exp-row:hover::after { width: 100%; }

  .w-exp-row .idx { font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .w-exp-row .role { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .w-exp-row .role-line {
    font-family: var(--serif); font-size: 28px; line-height: 1.05;
    letter-spacing: -0.01em;
  }
  .w-exp-row .role-line em { font-style: italic; color: var(--accent); }
  .w-exp-row .r-at { color: var(--muted); }
  .w-exp-row .r-sum {
    font-family: var(--sans); font-size: 13px; line-height: 1.55;
    color: var(--ink-2); max-width: 56ch;
  }
  .w-exp-row .loc {
    font-family: var(--mono); font-size: 11px; color: var(--ink-2);
    text-transform: uppercase; letter-spacing: .14em;
  }
  .w-exp-row .year {
    font-family: var(--mono); font-size: 12px;
    color: var(--muted); text-align: right;
  }
  .w-exp-row .toggle {
    font-family: var(--mono); font-size: 20px; color: var(--ink);
    text-align: right; transition: transform .4s var(--ease), color .3s;
    line-height: 1;
  }
  .w-exp-item.is-open .toggle { color: var(--accent); transform: rotate(180deg); }

  /* Detail panel */
  .w-exp-detail-inner {
    padding: 0 0 36px 92px; /* indent past the 60px idx + 32px gap */
    display: grid; gap: 24px;
    max-width: 980px;
  }
  .detail-meta {
    display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 24px;
    padding-bottom: 20px; border-bottom: 1px dashed var(--line);
  }
  .detail-meta .k {
    display: block;
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em;
    margin-bottom: 6px;
  }
  .detail-meta .v {
    font-family: var(--sans); font-size: 13px; color: var(--ink);
  }
  .detail-meta .stack-cell .v {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .bullets {
    list-style: none; display: flex; flex-direction: column;
    gap: 14px; padding: 0;
  }
  .bullets li {
    display: grid; grid-template-columns: 12px 1fr; gap: 14px;
    align-items: baseline;
    font-size: 15px; line-height: 1.65; color: var(--ink-2);
  }
  .bullets .dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
    margin-top: 0.5em;
  }
  .detail-link {
    display: inline-flex; gap: 8px;
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--ink);
    margin-top: 4px;
    transition: gap .3s, color .3s;
  }
  .detail-link:hover { gap: 14px; color: var(--accent); }

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
    .w-experience { padding: 0 24px 80px; }
    .row-head, .w-exp-row { grid-template-columns: 36px 1fr 60px; gap: 14px; padding: 18px 0; }
    .row-head > *:nth-child(3),
    .row-head > *:nth-child(4),
    .w-exp-row .loc,
    .w-exp-row .year { display: none; }
    .row-head > *:last-child { text-align: right; }
    .w-exp-row .role-line { font-size: 20px; }
    .w-exp-row .toggle { font-size: 18px; }
    .w-exp-detail-inner { padding: 0 0 28px 50px; }
    .detail-meta { grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-meta .stack-cell { grid-column: span 2; }
    .bullets li { font-size: 14px; }
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
    .w-experience { padding: 0 18px 60px; }
    .w-exp-row { padding: 16px 0; grid-template-columns: 28px 1fr 30px; gap: 10px; }
    .w-exp-row .idx { font-size: 11px; }
    .w-exp-row .role-line { font-size: 18px; }
    .w-exp-row .r-sum { font-size: 12px; }
    .w-exp-detail-inner { padding: 0 0 24px 38px; }
    .detail-meta { grid-template-columns: 1fr; gap: 12px; }
    .detail-meta .stack-cell { grid-column: span 1; }
    .w-stats { padding: 22px 16px; margin: 0 18px 50px; }
    .w-cta { padding: 56px 18px; }
  }
`;
