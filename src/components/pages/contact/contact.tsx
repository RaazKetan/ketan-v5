import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DesignLayout, GridBg, Word } from "../../design";
import { useDesignAnimations } from "../../../Hooks/useDesignAnimations";
import { usePersonalData } from "../../../context/PersonalDataContext";
import { RouteSEO } from "../../seo/RouteSEO";
import { trackContact } from "../../../lib/analytics";

gsap.registerPlugin(ScrollTrigger);

const TOPICS = [
  "Product engineering",
  "Systems & infra",
  "Agent tooling",
  "Advising",
  "Speaking",
  "Something else",
];


export const Contact: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const { contactInfo } = usePersonalData();
  useDesignAnimations();

  const channels = [
    { label: "Email", value: contactInfo.email, href: `mailto:${contactInfo.email}` },
    { label: "GitHub", value: "@" + contactInfo.github.split("/").pop(), href: contactInfo.github },
    { label: "Medium", value: contactInfo.medium.split("@").pop() ? "@" + contactInfo.medium.split("@").pop() : "Medium", href: contactInfo.medium },
    { label: "Topmate", value: "Book 30 min", href: contactInfo.topmate },
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });
    tl.from(".c-label", { autoAlpha: 0, y: 18, duration: 1.1 }, 0)
      .from(".c-hero h1 .word > span", { yPercent: 110, duration: 1.6, stagger: 0.12 }, 0.2)
      .from(".c-sub", { autoAlpha: 0, y: 18, duration: 1.2 }, 1.2);
  });

  const toggleTopic = (t: string) => {
    setTopics((cur) => {
      const next = new Set(cur);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      trackContact("topic_toggle", { topic: t, now: next.has(t) });
      return next;
    });
  };

  /* Hand the message off to the visitor's email client. No backend means
     no PII ever hits a server we don't own (and no spam-bot honeypot to
     maintain). The browser caps mailto bodies at ~2000 chars, so we
     truncate textarea + name to safe lengths. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    const success = successRef.current;
    if (!form) return;

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").slice(0, 80).trim();
    const fromEmail = String(fd.get("email") || "").slice(0, 120).trim();
    const message = String(fd.get("message") || "").slice(0, 1400).trim();
    const interests = Array.from(topics).join(", ");

    trackContact("submit", {
      topics: interests,
      has_name: !!name,
      has_email: !!fromEmail,
      msg_len: message.length,
    });

    /* Build a plain-text body. encodeURIComponent handles newlines + special
       chars so the mailto link can't be hijacked by control characters in
       user input. */
    const subject = `Portfolio · ${name || "new note"}`;
    const lines = [
      `From: ${name || "(no name)"} <${fromEmail || "no email"}>`,
      interests ? `Interests: ${interests}` : "",
      "",
      message || "(no message)",
    ].filter(Boolean);
    const mailto =
      `mailto:${contactInfo.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(lines.join("\n"))}`;

    /* Use a transient anchor — direct window.location assignment in some
       browsers (Safari iOS) gets blocked when triggered outside the click
       event tick; an in-DOM <a> click stays inside the user gesture. */
    const a = document.createElement("a");
    a.href = mailto;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    if (!success) return;
    gsap.to(form, {
      autoAlpha: 0,
      y: -10,
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        setSubmitted(true);
        requestAnimationFrame(() => {
          if (successRef.current) {
            gsap.from(successRef.current, {
              autoAlpha: 0,
              y: 20,
              duration: 0.8,
              ease: "power3.out",
            });
          }
        });
      },
    });
  };

  return (
    <DesignLayout>
      <RouteSEO
        title="Contact - Ketan Raj"
        description="Reach Ketan Raj for collaborations, advisory, speaking, or hiring. Email, Topmate, LinkedIn, and a quick contact form."
        path="/contact"
      />
      <section className="c-hero">
        <div>
          <div className="c-label">05 / Contact</div>
          <h1 data-split>
            <Word>Let's</Word> <Word>make</Word> <Word em>something</Word>{" "}
            <Word>quiet.</Word>
          </h1>
          <p className="c-sub">
            Tell me about the work. I read every note that lands here, and reply
            within a day or two.
          </p>
          <p className="c-intro">
            Whether you're building an agent product, untangling a backend,
            hiring for a hard problem, or want me to speak or advise — I'd like
            to hear about it. The more concrete you can be about what you're
            making, who it's for, and where you're stuck, the more useful my
            first reply will be. I take on a small number of projects at a time
            and care most about work where careful engineering actually moves the
            outcome. If a live conversation is easier, you can book a 30-minute
            session on Topmate, or reach me directly over email, GitHub,
            LinkedIn, and Medium below.
          </p>
        </div>
      </section>

      <section className="form-wrap">
        <aside className="form-side">
          <div className="item">
            <h6>Email</h6>
            <a className="v" href={`mailto:${contactInfo.email}`}>
              {contactInfo.email}
            </a>
            <div className="small">Direct line · usually within 24h</div>
          </div>
          <div className="item">
            <h6>Topmate</h6>
            <a className="v" href={contactInfo.topmate} target="_blank" rel="noreferrer">
              Book 30 min ↗
            </a>
            <div className="small">1:1 chats · paid sessions</div>
          </div>
          <div className="item">
            <h6>Elsewhere</h6>
            <a className="v" href={contactInfo.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a className="v" href={contactInfo.medium} target="_blank" rel="noreferrer">
              Medium ↗
            </a>
            <a className="v" href={contactInfo.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
          <div className="item">
            <h6>Location</h6>
            <span className="v">{contactInfo.locationLong}</span>
            <div className="small">{contactInfo.timezone}</div>
          </div>
        </aside>

        <div className="form-col">
          {!submitted && (
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="field">
                <label>Your name</label>
                <input name="name" type="text" placeholder="What should I call you?" required maxLength={80} autoComplete="name" />
              </div>
              <div className="field">
                <label>Email</label>
                <input name="email" type="email" placeholder="where I can reach you" required maxLength={120} autoComplete="email" />
              </div>
              <div className="field">
                <label>I'm thinking about</label>
                <div className="pill-row">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`pill${topics.has(t) ? " is-active" : ""}`}
                      onClick={() => toggleTopic(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Tell me about it</label>
                <textarea
                  name="message"
                  placeholder="What are you building, who is it for, and where are you stuck?"
                  rows={5}
                  maxLength={1400}
                />
              </div>
              <div className="submit-row">
                <div className="note">Submitting opens your email client with the note prefilled - hit send there.</div>
                <button type="submit" className="submit-btn" data-magnet="">
                  <span>Send the note</span>
                  <span>↗</span>
                </button>
              </div>
            </form>
          )}

          {submitted && (
            <div className="form-success" ref={successRef}>
              <h3>
                Message <em>sent.</em>
              </h3>
              <p>
                I'll get back to you within a day or two - thanks for writing.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="closer">
        <div className="closer-bg">
          <GridBg count={3} />
        </div>
        <div className="big">
          <div>
            <Word>Until</Word> <Word>then,</Word>
          </div>
          <div>
            <Word em>be well.</Word>
          </div>
        </div>

        <div className="channels">
          {channels.map((c) => (
            <a
              key={c.label}
              className="channel"
              href={c.href}
              target={c.href.startsWith("mailto") ? undefined : "_blank"}
              rel={c.href.startsWith("mailto") ? undefined : "noreferrer"}
              data-magnet="0.1"
            >
              <h6>{c.label}</h6>
              <div className="v">
                <span>{c.value}</span>
                <span>↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <style>{styles}</style>
    </DesignLayout>
  );
};

const styles = `
  .c-hero {
    min-height: 60vh; padding: 160px 56px 80px;
    max-width: var(--maxw); margin: 0 auto;
    display: grid; align-items: end; position: relative;
  }
  .c-label {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .14em; margin-bottom: 32px;
    display: flex; align-items: center; gap: 12px;
  }
  .c-label::before { content: ""; width: 32px; height: 1px; background: var(--ink); }
  .c-hero h1 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(80px, 16vw, 280px);
    line-height: 0.86; letter-spacing: -0.03em;
  }
  .c-hero h1 em { font-style: italic; color: var(--accent); }
  .c-sub {
    margin-top: 32px;
    font-family: var(--serif); font-style: italic;
    font-size: 24px; line-height: 1.4; color: var(--ink-2); max-width: 50ch;
  }
  .c-intro {
    margin-top: 24px;
    font-size: 16px; line-height: 1.7; color: var(--ink-2); max-width: 64ch;
  }

  /* Form */
  .form-wrap {
    padding: 80px 56px 120px; max-width: var(--maxw); margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1.2fr; gap: 96px;
    align-items: start;
  }
  .form-side { position: sticky; top: 120px; }
  .form-side h6 {
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--muted); margin-bottom: 14px;
  }
  .form-side .item { margin-bottom: 40px; }
  .form-side .v {
    font-family: var(--serif); font-size: 28px; line-height: 1.2;
    display: block; transition: color .3s;
  }
  .form-side a.v:hover { color: var(--accent); }
  .form-side .small {
    font-family: var(--mono); font-size: 11px; color: var(--muted); margin-top: 4px;
  }

  form { display: grid; gap: 28px; }
  .field { position: relative; }
  .field label {
    display: block; font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
    margin-bottom: 10px;
  }
  .field input, .field textarea {
    width: 100%; background: transparent;
    border: 0; border-bottom: 1px solid var(--line);
    font-family: var(--serif); font-size: 24px;
    color: var(--ink); padding: 8px 0; outline: none;
    transition: border-color .3s;
  }
  .field input::placeholder, .field textarea::placeholder {
    color: var(--muted); font-style: italic;
  }
  .field textarea { resize: vertical; min-height: 120px; line-height: 1.4; }
  .field input:focus, .field textarea:focus { border-color: var(--accent); }

  .pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em;
    padding: 8px 14px; border-radius: 999px;
    border: 1px solid var(--line); color: var(--ink-2);
    cursor: pointer; transition: all .3s var(--ease);
    background: var(--bg);
  }
  .pill:hover { border-color: var(--ink); }
  .pill.is-active {
    background: var(--ink); color: var(--bg); border-color: var(--ink);
  }

  .submit-row {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 16px; gap: 16px; flex-wrap: wrap;
  }
  .submit-row .note { font-family: var(--mono); font-size: 11px; color: var(--muted); }

  .submit-btn {
    position: relative; isolation: isolate;
    background: var(--ink); color: var(--bg);
    padding: 22px 36px; border-radius: 999px;
    font-family: var(--mono); font-size: 12px; letter-spacing: .14em;
    text-transform: uppercase; border: 0; cursor: pointer;
    display: inline-flex; align-items: center; gap: 14px; overflow: hidden;
    transition: gap .3s var(--ease);
  }
  .submit-btn::before {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(110deg, transparent 25%, color-mix(in oklab, var(--accent) 70%, white) 45%, transparent 65%);
    transform: translateX(-100%); animation: shimmer 2.6s linear infinite;
  }
  .submit-btn > * { position: relative; z-index: 1; }
  .submit-btn:hover { gap: 22px; }

  .form-success { text-align: center; padding: 60px 0; }
  .form-success h3 {
    font-family: var(--serif); font-size: 56px; line-height: 1; margin-bottom: 20px;
  }
  .form-success h3 em { font-style: italic; color: var(--accent); }
  .form-success p { font-size: 15px; color: var(--ink-2); }

  /* Closer */
  .closer {
    padding: 120px 56px; max-width: var(--maxw); margin: 0 auto;
    position: relative; overflow: hidden;
  }
  .closer-bg { position: absolute; inset: 0; opacity: .5; }
  .closer .big {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(80px, 17vw, 320px);
    line-height: 0.86; letter-spacing: -0.03em;
    text-align: center;
    position: relative;
  }
  .closer .big em { font-style: italic; color: var(--accent); }

  .channels {
    margin-top: 80px;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    border-top: 1px solid var(--line); padding-top: 40px;
    position: relative;
  }
  .channel {
    border: 1px solid var(--line); border-radius: 6px; padding: 24px;
    transition: all .35s var(--ease);
    position: relative; overflow: hidden;
  }
  .channel:hover { border-color: var(--accent); transform: translateY(-2px); }
  .channel h6 {
    font-family: var(--mono); font-size: 10px; text-transform: uppercase;
    letter-spacing: .14em; color: var(--muted); margin-bottom: 14px;
  }
  .channel .v {
    font-family: var(--serif); font-size: 22px; line-height: 1.2;
    display: flex; align-items: center; justify-content: space-between;
  }
  .channel .v span:last-child { font-size: 14px; color: var(--accent); }

  @media (max-width: 1100px) {
    .c-hero h1 { font-size: clamp(64px, 13vw, 160px); }
  }
  @media (max-width: 900px) {
    .c-hero { padding: 130px 24px 50px; min-height: auto; }
    .c-hero h1 { font-size: clamp(48px, 12vw, 96px); }
    .c-sub { font-size: 18px; }
    .form-wrap {
      grid-template-columns: 1fr;
      gap: 40px;
      padding: 60px 24px 80px;
    }
    .form-side { position: static; }
    .form-side .item { margin-bottom: 28px; }
    .form-side .v { font-size: 22px; }
    .field input, .field textarea { font-size: 20px; }
    .submit-row { flex-direction: column; align-items: stretch; }
    .submit-btn { justify-content: center; }
    .closer { padding: 70px 24px; }
    .closer .big { font-size: clamp(48px, 14vw, 120px); }
    .channels { grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 50px; padding-top: 28px; }
    .channel { padding: 18px; }
    .channel .v { font-size: 18px; }
  }
  @media (max-width: 600px) {
    .c-hero { padding: 140px 18px 40px; }
    .c-hero h1 { font-size: clamp(42px, 12vw, 72px); }
    .c-sub { font-size: 16px; }
    .form-wrap { padding: 40px 18px 60px; gap: 32px; }
    .form-side .v { font-size: 20px; }
    .field input, .field textarea { font-size: 18px; }
    .submit-btn { padding: 18px 28px; font-size: 11px; }
    .closer { padding: 60px 18px; }
    .channels { grid-template-columns: 1fr; }
  }
`;
