/* Curated portfolio projects + blog posts. */

export type ProjectKind = "Agent" | "AI" | "Full-stack" | "Tooling" | "Creative";

export type Project = {
  slug: string;
  name: string;       // hero name, e.g. "Origin"
  titleHead: string;  // "Origin -"
  titleEm: string;    // emphasised italic word
  titleTail: string;  // remainder
  short: string;      // 1-line tagline (cards)
  long: string;       // case-study paragraph
  role: string;
  org: string;
  kind: ProjectKind;
  tech: string[];
  year: string;
  yearRange: string;
  repo: string;
  live?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "origin",
    name: "Origin",
    titleHead: "Origin - an",
    titleEm: "agentic",
    titleTail: "AI hiring platform.",
    short:
      "Agents source jobs based on the work you've actually shipped - no resumes, no keyword games.",
    long: "Origin is a hiring platform run by agents. Candidates ship work; agents read it, match it against real openings, and shortlist on substance. The whole loop - sourcing, screening, scheduling - happens autonomously in the background while you keep building. The bet: signal beats application volume, and agents are good enough to find it.",
    role: "Founder · Author",
    org: "In development",
    kind: "Agent",
    tech: ["Python", "LLM", "Agents", "Hiring"],
    year: "2026",
    yearRange: "2025 - Now",
    repo: "https://github.com/RaazKetan/Origin",
  },
  {
    slug: "reublic",
    name: "Reublic",
    titleHead: "Reublic - a",
    titleEm: "revolutionary",
    titleTail: "AI agent.",
    short:
      "Multi-step planning agent that automates complex workflows end-to-end.",
    long: "Reublic is an agent built for ambitious, multi-step workflows - research, drafting, execution. Plans are explicit, intermediate state is inspectable, and recovery is built in. The point is to make agentic work auditable, not magic.",
    role: "Author · Solo",
    org: "Open source",
    kind: "Agent",
    tech: ["Python", "LLM", "Planning"],
    year: "2026",
    yearRange: "2026",
    repo: "https://github.com/RaazKetan/Reublic-The-Revolution-AI-Agent",
  },
  {
    slug: "imagine",
    name: "Imagine",
    titleHead: "Imagine - an",
    titleEm: "AI",
    titleTail: "image studio.",
    short:
      "AI image generation studio - Next.js, Clerk, Cloudinary, Stripe. 2000+ daily transformations.",
    long: "Imagine is an end-to-end AI image studio: prompt -> generation -> gallery, with credits and billing wired in. Full-stack Next.js with Clerk for auth, Cloudinary for media, and Stripe for payments - the kind of project that exercises every layer at 99.9% uptime.",
    role: "Author · Solo",
    org: "Open source",
    kind: "Full-stack",
    tech: ["Next.js", "TypeScript", "Clerk", "Cloudinary", "Stripe", "MongoDB"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/imagine",
    live: "https://imagine-alpha.vercel.app",
  },
];

/* Featured projects: surface on the home page. */
export const FEATURED: Project[] = PROJECTS;

/* Archive kept as an alias so any legacy import doesn't break. */
export const ARCHIVE: Project[] = PROJECTS;

/* ============ Blog posts (Medium) ============ */

import adkCover from "../assets/ADK.png";
import dijCover from "../assets/Dij.png";
import googleCover from "../assets/Google.png";

export type BlogPost = {
  slug: string;
  title: string;
  titleHead: string;  // first chunk
  titleEm: string;    // emphasised italic word
  titleTail: string;  // remainder
  summary: string;
  url: string;
  publication: string;
  date: string;       // "Aug 21, 2025"
  year: string;       // "2025"
  readTime: string;   // "4 min"
  tags: string[];
  cover?: string;     // imported image url
};

export const BLOGS: BlogPost[] = [
  {
    slug: "google-adk-streamlit",
    title: "Build your Agent: A Deep Dive into Google ADK and Streamlit Integration",
    titleHead: "Build your",
    titleEm: "Agent",
    titleTail: "- ADK + Streamlit, end to end.",
    summary:
      "A practical walk-through of wiring Google ADK agents into a Streamlit UI - state, tool calls, and the smallest viable agentic chatbot you can ship in an afternoon.",
    url: "https://medium.com/@ketanraaz/build-your-agent-a-deep-dive-into-google-adk-and-streamlit-integration-cee9d79164e4",
    publication: "Medium",
    date: "2025",
    year: "2025",
    readTime: "6 min",
    tags: ["Google ADK", "Streamlit", "Agents", "Python"],
    cover: adkCover,
  },
  {
    slug: "dijkstra-dethroned",
    title: "The 60-Year-Old Algorithm We Thought Was Unbeatable Just Got Dethroned",
    titleHead: "The 60-year-old",
    titleEm: "algorithm",
    titleTail: "just got dethroned.",
    summary:
      "Dijkstra has held the shortest-path crown since 1956. A new algorithm from 2025 beats it on bounds we thought were optimal. What changed, and what it means for graphs at scale.",
    url: "https://medium.com/@ketanraaz/the-60-year-old-algorithm-we-thought-was-unbeatable-just-got-dethroned-388486641238",
    publication: "Medium",
    date: "Aug 21, 2025",
    year: "2025",
    readTime: "4 min",
    tags: ["Algorithms", "Graphs", "Research"],
    cover: dijCover,
  },
  {
    slug: "google-monorepo",
    title: "Why Google Put Its Billions of Lines of Code Into One",
    titleHead: "Why",
    titleEm: "Google",
    titleTail: "put billions of lines into one repo.",
    summary:
      "Mono-repo vs. polyrepo isn't just a tooling decision - it shapes how teams collaborate, how fast you refactor, and how painful cross-project changes get. Notes from the inside.",
    url: "https://medium.com/@ketanraaz/why-google-put-its-billions-of-lines-of-code-into-one-0a0241ac60b3",
    publication: "Medium",
    date: "Sep 8, 2025",
    year: "2025",
    readTime: "3 min",
    tags: ["Monorepo", "Engineering", "Tooling"],
    cover: googleCover,
  },
];
