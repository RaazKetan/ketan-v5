import React, { createContext, useContext } from "react";
import { EXPERIENCE, type Experience } from "@/data/experience";
import { GoogleMark } from "@/components/design/GoogleMark";

/* All editable media lives here so content (text, images, video) is in ONE
   place — swap a portrait or the reel by changing the import below, no need to
   hunt through page components. Vite turns each import into a URL string, so
   the bytes are only fetched when the relevant <img>/<video> actually renders. */
import portraitImg from "@/assets/BC.jpeg";
import hackathonImg from "@/assets/HC1.jpeg";
import grassImg from "@/assets/HC2.jpeg";
import workspaceImg from "@/assets/workspace.jpeg";
import cocoImg from "@/assets/coco.jpeg";
import googleImg from "@/assets/google.jpeg";
import reelVideo from "@/assets/me.mp4";

export type HeroTitleProps = {
  name: string;
  title: string;
  location?: string;
};

/* New centralized data shapes - every page reads from these. */

export type StripItem = { label: React.ReactNode; meta: string };
export type HeroStripData = {
  taglineNum: string;
  taglineBody: string;       // serif italic body, supports raw HTML for <em>
  focus: string;
  available: string;
  currently: StripItem[];
  recent: StripItem[];
  stack: StripItem[];
};

export type ContactInfo = {
  email: string;
  topmate: string;
  github: string;
  medium: string;
  linkedin: string;
  twitter?: string;
  locationShort: string;     // "Bengaluru, IN"
  locationLong: string;      // "Bengaluru, Karnataka"
  timezone: string;          // "IST · UTC+5:30 · 12.97° N"
  coords: { lat: string; lon: string };
  availability: string;      // "Available · Q3 2026"
};

export type FooterInfo = {
  status: string;
  craft: string;
  copyright: string;
};

export type BentoBook = { title: string; author: string; year: string };
export type BentoSoundtrack = { title: string; meta: string };
export type BentoGear = { name: string; ds: string };
export type BentoStack = { name: string; pct?: string };
/* An image tile: the resolved asset URL + its overlay caption. */
export type BentoMedia = { src: string; caption: string; meta?: string };

export type BentoData = {
  statement: string;
  statementBody: string;
  philosophyTagline: string; // 2-line serif tagline with <em>
  philosophyBody: string;
  nowText: string;           // "Filter coffee in hand. Sketching an <em>agent</em> orchestration spec."
  nowUpdated: string;
  musicTitle: string;        // "Lofi for late commits - <em>monsoon mix vol. 4.</em>"
  musicMeta: string;
  reelLabel: string;
  pullQuote: string;         // serif italic quote with <em>
  pullQuoteAttr: string;
  workshopTagline: string;
  workshopBody: string;
  motto: string[];           // marquee items
  books: BentoBook[];
  stack: BentoStack[];
  soundtrack: BentoSoundtrack[];
  gear: BentoGear[];
  /* About-page media — images + the reel video. */
  portrait: BentoMedia;      // portrait tile (meta = timestamp badge)
  photoA: BentoMedia;        // first photo tile
  photoB: BentoMedia;        // second photo tile
  reel: { src: string; year: string };
  gallery: BentoMedia[];     // the trailing mood/photo tiles
};

export type WorkPageInfo = {
  shippingStartYear: number;
  ledeShort: string;
  ledeLong: string;
  ctaHeadline: string[];     // ["Currently", "booking", "Q3."]
};

export type PersonalData = {
  heroTitle: HeroTitleProps;
  heroStrip: HeroStripData;
  contactInfo: ContactInfo;
  footerInfo: FooterInfo;
  bentoData: BentoData;
  workInfo: WorkPageInfo;
  experience: Experience[];
};

const defaultData: PersonalData = {
  heroTitle: {
    name: "Ketan Raj",
    title: "SWE",
    location: "Bengaluru, India",
  },
  heroStrip: {
    taglineNum: "01",
    taglineBody:
      "Building <em>AI agents</em> &amp; intelligent backends - agentic loops that ship to real users and survive production.",
    focus: "AI agents · LLM systems · Backends",
    available: "",
    currently: [
      { label: "SWE @ Emergent (YC24)", meta: "'26-" },
      { label: "Agentic AI · production loops", meta: "now" },
      { label: "Origin - agentic hiring platform", meta: "building" },
    ],
    recent: [
      {
        label: (
          <>
            SWE <GoogleMark />
          </>
        ),
        meta: "'25",
      },
      { label: "ADK workshops · 200+ engineers", meta: "'25" },
      { label: "Vertex AI · RAG · LLM orchestration", meta: "'25" },
    ],
    stack: [
      { label: "Python · TypeScript · Go", meta: "-" },
      { label: "Google ADK · Vertex AI · LangChain", meta: "-" },
      { label: "FastAPI · Postgres · Kubernetes", meta: "-" },
    ],
  },
  contactInfo: {
    email: "21ketanraaz@gmail.com",
    topmate: "https://topmate.io/ketan_raj",
    github: "https://github.com/RaazKetan",
    medium: "https://medium.com/@ketanraaz",
    linkedin: "https://www.linkedin.com/in/ketanraj",
    locationShort: "Bengaluru, IN",
    locationLong: "Bengaluru, Karnataka",
    timezone: "IST · UTC+5:30 · 12.97° N",
    coords: { lat: "12.9716° N", lon: "77.5946° E" },
    availability: "Available · Q3 2026",
  },
  footerInfo: {
    status: "SWE @ Emergent (YC24)",
    craft: "Designed & engineered in Bengaluru · v6.0",
    copyright: "© 2026 Ketan Raj",
  },
  bentoData: {
    statement: "I build <em>AI agents</em> that ship.",
    statementBody:
      "Agentic loops with planning, tool use, structured memory, and human-in-the-loop safeguards - the boring infrastructure that lets agents actually run in production. Shipped 18+ at Google, now building Emergent's product surface and Origin (agentic hiring).",
    philosophyTagline:
      "Software is mostly <em>typography</em> and time.<br/>Latency is a feature. The best abstraction is the one you delete.",
    philosophyBody:
      "Think in systems, not features. Complexity is a design smell. If a task is done twice manually, it should be code. Depth over trends.",
    nowText:
      "Filter coffee in hand. Sketching an <em>agent</em> orchestration spec.",
    nowUpdated: "Updated 06 min ago · auto",
    musicTitle: "Lofi for late commits - <em>monsoon mix vol. 4.</em>",
    musicMeta: "3'42\" / 7'18\" · headphones on",
    reelLabel: "Showreel · live",
    pullQuote:
      "Pay the <em>boring</em> debts first.<br/>The user's loading spinner is your résumé.",
    pullQuoteAttr: "- from a margin in a notebook",
    workshopTagline: "The <em>workshop.</em>",
    workshopBody:
      "A small desk by a tall window. Mechanical keyboard, filter coffee brewing, a notebook always open. The tools I reach for, daily.",
    motto: [
      "quiet software",
      "slow productivity",
      "small teams",
      "long walks",
      "good defaults",
      "sharp tools",
      "no slop",
      "fewer features",
    ],
    books: [
      { title: "A Pattern Language", author: "Alexander", year: "'77" },
      { title: "The Mythical Man-Month", author: "Brooks", year: "'75" },
      { title: "The Order of Time", author: "Rovelli", year: "'18" },
      { title: "Slow Productivity", author: "Newport", year: "'24" },
    ],
    stack: [
      { name: "Python" },
      { name: "TypeScript" },
      { name: "Go" },
      { name: "Google ADK · Vertex AI" },
      { name: "FastAPI · LangChain" },
      { name: "Postgres · Kubernetes" },
    ],
    soundtrack: [
      { title: "Sostre - Quietude", meta: "Ambient · 2024" },
      { title: "The Necks - Three", meta: "Jazz · 2020" },
      { title: "Floating Points - Promises", meta: "Modern classical · 2021" },
    ],
    gear: [
      { name: "MacBook", ds: "M2 · daily driver" },
      { name: "ASUS ROG Zephyrus G14", ds: "Gaming rig" },
      { name: "Dell P3223QE", ds: '32" 4K · matte' },
      { name: "Redgear keyboard", ds: "Gaming · mechanical" },
      { name: "Logitech mouse", ds: "Daily" },
      { name: "Sony WH-CH520", ds: "Headphones · long sessions" },
      { name: "Nikon Coolpix P600", ds: "Field camera" },
      { name: "Terminal", ds: "Warp · zsh · vim" },
    ],
    /* About-page media — swap an image/video by editing the import at the top
       of this file, and its caption right here. */
    portrait: { src: portraitImg, caption: "Portrait", meta: "02:46" },
    photoA: { src: hackathonImg, caption: "Hackathon · win" },
    photoB: { src: grassImg, caption: "Touching Grass" },
    reel: { src: reelVideo, year: "Reel · 2024" },
    gallery: [
      { src: workspaceImg, caption: "Workspace" },
      { src: cocoImg, caption: "Coco" },
      { src: googleImg, caption: "Google" },
    ],
  },
  workInfo: {
    shippingStartYear: 2024,
    ledeShort: "Selected · 2024 - Now",
    ledeLong:
      "Roles, internships, and independent stints - what I've worked on, with whom, and what I shipped. Tap any row for the bullet-point version.",
    ctaHeadline: ["Currently", "booking", "Q3."],
  },
  experience: EXPERIENCE,
};

const PersonalDataContext = createContext<PersonalData>(defaultData);
export const usePersonalData = () => useContext(PersonalDataContext);

export const PersonalDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PersonalDataContext.Provider value={defaultData}>
      {children}
    </PersonalDataContext.Provider>
  );
};
