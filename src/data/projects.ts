/* Curated portfolio projects sourced from github.com/RaazKetan.
   Each entry maps a GitHub repo to a portfolio-friendly title, tagline,
   role, tech list, year, and external links. */

export type ProjectKind = "Agent" | "AI" | "Full-stack" | "Tooling" | "Creative";

export type Project = {
  slug: string;
  name: string;       // hero name, e.g. "Origin"
  titleHead: string;  // "Origin —"
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
    titleHead: "Origin — an",
    titleEm: "agentic",
    titleTail: "AI hiring platform.",
    short:
      "Agents source jobs based on the work you've actually shipped — no resumes, no keyword games.",
    long: "Origin is a hiring platform run by agents. Candidates ship work; agents read it, match it against real openings, and shortlist on substance. The whole loop — sourcing, screening, scheduling — happens autonomously in the background while you keep building. The bet: signal beats application volume, and agents are good enough to find it.",
    role: "Founder · Author",
    org: "In development",
    kind: "Agent",
    tech: ["Python", "LLM", "Agents", "Hiring"],
    year: "2026",
    yearRange: "2025 — Now",
    repo: "https://github.com/RaazKetan/Origin",
  },
  {
    slug: "reublic",
    name: "Reublic",
    titleHead: "Reublic — a",
    titleEm: "revolutionary",
    titleTail: "AI agent.",
    short:
      "Multi-step planning agent that automates complex workflows end-to-end.",
    long: "Reublic is an agent built for ambitious, multi-step workflows — research, drafting, execution. Plans are explicit, intermediate state is inspectable, and recovery is built in. The point is to make agentic work auditable, not magic.",
    role: "Author · Solo",
    org: "Open source",
    kind: "Agent",
    tech: ["Python", "LLM", "Planning"],
    year: "2026",
    yearRange: "2026",
    repo: "https://github.com/RaazKetan/Reublic-The-Revolution-AI-Agent",
  },
  {
    slug: "resume-agent",
    name: "Resume Sortlist Agent",
    titleHead: "Resume Sortlist — an",
    titleEm: "AI",
    titleTail: "screening agent.",
    short:
      "AI agent that screens and ranks resumes against a job spec — explainable and fast.",
    long: "Hiring managers waste hours on resume screening; the agent turns that into seconds. It reads a JD, parses incoming resumes, and ranks candidates with a justification trail. Built so the agent's reasoning is the product, not a hidden black box.",
    role: "Author · Solo",
    org: "Open source",
    kind: "AI",
    tech: ["Python", "LLM", "NLP"],
    year: "2025",
    yearRange: "2025",
    repo: "https://github.com/RaazKetan/ai-agent-resume-sortlist",
  },
  {
    slug: "adk-voice",
    name: "ADK Voice Agent",
    titleHead: "Voice Agent — built on",
    titleEm: "Google",
    titleTail: "ADK.",
    short:
      "Voice-driven assistant built on Google's Agent Development Kit.",
    long: "A real-time voice agent built on Google's ADK — speech in, tool-using reasoning, structured output. The interesting part is the latency budget: every hop has to fit inside a conversational rhythm. Built as a reference for what voice-native agents feel like.",
    role: "Author · Solo",
    org: "Open source",
    kind: "Agent",
    tech: ["Python", "Google ADK", "Speech"],
    year: "2025",
    yearRange: "2025",
    repo: "https://github.com/RaazKetan/Google_ADK_Voice_Agent",
  },
  {
    slug: "imagine",
    name: "Imagine",
    titleHead: "Imagine — an",
    titleEm: "AI",
    titleTail: "image studio.",
    short:
      "AI image generation studio — Next.js, Clerk, Cloudinary, Stripe.",
    long: "Imagine is an end-to-end AI image studio: prompt → generation → gallery, with credits and billing wired in. Full-stack Next.js with Clerk for auth, Cloudinary for media, and Stripe for payments — the kind of project that exercises every layer.",
    role: "Author · Solo",
    org: "Open source",
    kind: "Full-stack",
    tech: ["Next.js", "TypeScript", "Clerk", "Cloudinary", "Stripe", "MongoDB"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/imagine",
    live: "https://imagine-alpha.vercel.app",
  },
  {
    slug: "taskmaster",
    name: "TaskMaster",
    titleHead: "TaskMaster — a",
    titleEm: "collaborative",
    titleTail: "task workspace.",
    short:
      "Real-time collaborative task management with team workspaces and analytics.",
    long: "TaskMaster is a clean take on shared task lists — multi-user workspaces, real-time updates, and just enough analytics to keep teams honest. Built to be the lightest possible tool that still feels serious.",
    role: "Author · Solo",
    org: "Open source",
    kind: "Full-stack",
    tech: ["JavaScript", "React", "Node.js", "WebSocket"],
    year: "2025",
    yearRange: "2025",
    repo: "https://github.com/RaazKetan/TaskMaster_2",
  },
];

/* Archive: longer list used on /work, includes the 6 case studies plus
   additional shipped work. */
export const ARCHIVE: Project[] = [
  ...PROJECTS,
  {
    slug: "tata-cliq-agent",
    name: "Tata Cliq Agent",
    titleHead: "Tata Cliq Agent — a",
    titleEm: "browsing",
    titleTail: "automation.",
    short:
      "Agent that automates discovery and checkout flows on Tata Cliq.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Agent",
    tech: ["HTML", "JS", "Agent"],
    year: "2026",
    yearRange: "2026",
    repo: "https://github.com/RaazKetan/Tata_Cliq_Agent",
  },
  {
    slug: "linkedin-post-agent",
    name: "LinkedIn Post Agent",
    titleHead: "LinkedIn Agent — a",
    titleEm: "drafting",
    titleTail: "agent.",
    short:
      "Agent that drafts LinkedIn posts in your voice from a short prompt.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Agent",
    tech: ["Python", "LLM"],
    year: "2025",
    yearRange: "2025",
    repo: "https://github.com/RaazKetan/linkedin-post-gen-agent",
  },
  {
    slug: "adk-postgres",
    name: "ADK + Postgres",
    titleHead: "ADK Postgres — an",
    titleEm: "agent",
    titleTail: "memory.",
    short:
      "Google ADK agent wired to Postgres — agentic queries with structured memory.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Agent",
    tech: ["Python", "Google ADK", "Postgres"],
    year: "2025",
    yearRange: "2025",
    repo: "https://github.com/RaazKetan/Google_adk_postgres",
  },
  {
    slug: "adk-streamlit",
    name: "ADK on Streamlit",
    titleHead: "ADK Streamlit — a",
    titleEm: "live",
    titleTail: "agent UI.",
    short:
      "Streamlit interface for live-debugging Google ADK agents in development.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Tooling",
    tech: ["Python", "Streamlit", "Google ADK"],
    year: "2025",
    yearRange: "2025",
    repo: "https://github.com/RaazKetan/Google-ADK-Streamlit",
  },
  {
    slug: "readme-editor",
    name: "README Editor",
    titleHead: "ReadmeEditor — a",
    titleEm: "live",
    titleTail: "markdown editor.",
    short:
      "Live README editor with preview, custom themes, and Figma-style controls.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Tooling",
    tech: ["React", "Tailwind", "Markdown"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/ReadmeEditor",
    live: "https://readme-editor-isr265x91-ketan-rajs-projects.vercel.app/",
  },
  {
    slug: "perkpass",
    name: "PerkPass",
    titleHead: "PerkPass — a",
    titleEm: "perks",
    titleTail: "aggregator.",
    short:
      "Discover and stack consumer perks in one place — built on Next.js.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Full-stack",
    tech: ["Next.js", "TypeScript"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/PerkPass",
    live: "https://perk-pass.vercel.app",
  },
  {
    slug: "luxelenses",
    name: "LuxeLenses",
    titleHead: "LuxeLenses — a",
    titleEm: "premium",
    titleTail: "eyewear store.",
    short:
      "E-commerce for premium eyewear — Firebase auth, Firestore, Redux.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Full-stack",
    tech: ["React", "Firebase", "Redux", "SCSS"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/LuxeLenses",
    live: "https://luxe-lenses.vercel.app/",
  },
  {
    slug: "portfolio-v4",
    name: "Portfolio v4",
    titleHead: "Folio v4 — the",
    titleEm: "previous",
    titleTail: "portfolio.",
    short:
      "Previous portfolio iteration — minimal, scroll-driven, with Three.js scenes.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Creative",
    tech: ["TypeScript", "React", "Three.js"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/ketan-v4",
    live: "https://ketanraaz.vercel.app",
  },
  {
    slug: "social-extension",
    name: "Social Extension",
    titleHead: "Social Extension — a",
    titleEm: "browser",
    titleTail: "companion.",
    short:
      "Chrome extension that streamlines cross-network social activity.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Tooling",
    tech: ["JavaScript", "Chrome Extension"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/Social_Extension",
  },
  {
    slug: "chatgpt-clone",
    name: "ChatGPT Clone",
    titleHead: "ChatGPT clone — a",
    titleEm: "streaming",
    titleTail: "playground.",
    short:
      "Conversational AI playground with streaming responses and chat history.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "AI",
    tech: ["Next.js", "TypeScript", "OpenAI"],
    year: "2024",
    yearRange: "2024",
    repo: "https://github.com/RaazKetan/chatgpt_clone",
    live: "https://chatgpt-clone-flame.vercel.app",
  },
  {
    slug: "brewnation",
    name: "Brewnation",
    titleHead: "Brewnation — a",
    titleEm: "coffee",
    titleTail: "landing.",
    short:
      "Coffee roastery landing with hand-crafted CSS animations.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Creative",
    tech: ["HTML", "CSS"],
    year: "2023",
    yearRange: "2023",
    repo: "https://github.com/RaazKetan/Brewnation",
    live: "https://brewnation-1-7f6u2ta0l-raazketan.vercel.app/",
  },
  {
    slug: "3dmania",
    name: "3D Mania",
    titleHead: "3D Mania — a",
    titleEm: "WebGL",
    titleTail: "playground.",
    short:
      "Interactive WebGL playground — Three.js shader explorations.",
    long: "",
    role: "Author · Solo",
    org: "Open source",
    kind: "Creative",
    tech: ["JavaScript", "Three.js", "GLSL"],
    year: "2023",
    yearRange: "2023",
    repo: "https://github.com/RaazKetan/3dMania",
    live: "https://3dmania.vercel.app",
  },
];

/* Featured projects: surface 4 on the home page. */
export const FEATURED: Project[] = PROJECTS.slice(0, 4);
