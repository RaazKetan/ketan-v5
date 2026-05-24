import React, { createContext, useContext } from "react";
import { EXPERIENCE, type Experience } from "../data/experience";
import { PROJECTS, ARCHIVE, FEATURED, type Project as PortfolioProject } from "../data/projects";

export type HeroTitleProps = {
  name: string;
  title: string;
  location?: string;
  company: string;
  aboutP1: string;
  aboutP2: string;
};

export type FooterProps = {
  footerNote: string;
  tagline: string;
};
export type LoaderProps = {
  loadingText: string;
};
export type MainNavbarProps = {
  navItems: Array<{
    number: string;
    label: string;
  }>;
};
export type TopBarProps = {
  topBarNickname: string;
  topBarFolioVersion: string;
};

export type AboutPageProps = {
  positioning: {
    statement: string;
    subStatement: string;
    focus: string;
  };
  philosophy: {
    heading: string;
    principles: Array<{
      title: string;
      description: string;
    }>;
  };
  background: {
    heading: string;
    narrative: string;
    videos: Array<{
      src: string;
      caption: string;
    }>;
  };
  explorations: {
    heading: string;
    items: string[];
  };
  workingWithMe: {
    heading: string;
    items: string[];
  };
  ambition: {
    text: string;
  };
};

export type Project = {
  id: string;
  name: string;
  description: string;
  tech: string[];
  liveLink?: string;
  sourceCode?: string;
  image?: string;
  color: string;
};

export type ProjectCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  projects: Project[];
};

export type ProjectsPageProps = {
  categories: ProjectCategory[];
};

/* New centralized data shapes — every page reads from these. */

export type StripItem = { label: string; meta: string };
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
export type BentoStack = { name: string; pct: string };

export type BentoData = {
  statement: string;
  statementBody: string;
  philosophyTagline: string; // 2-line serif tagline with <em>
  philosophyBody: string;
  nowText: string;           // "Filter coffee in hand. Sketching an <em>agent</em> orchestration spec."
  nowUpdated: string;
  musicTitle: string;        // "Lofi for late commits — <em>monsoon mix vol. 4.</em>"
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
  projects: PortfolioProject[];
  archive: PortfolioProject[];
  featured: PortfolioProject[];
  /* Legacy fields preserved for backwards compatibility with older components. */
  footerData: FooterProps;
  LoaderData: LoaderProps;
  MainNavbarData: MainNavbarProps;
  TopBarData?: TopBarProps;
  AboutPageData: AboutPageProps;
  ProjectsPageData: ProjectsPageProps;
};

const defaultData: PersonalData = {
  heroTitle: {
    name: "Ketan Raj",
    title: "SWE",
    company: "Google",
    location: "Bengaluru, India",
    aboutP1:
      "Ketan Raj (He/Him) AKA Raaz is a Software Engineer based in Bengaluru, India.",
    aboutP2:
      "Passionate about building innovative solutions and solving complex problems.",
  },
  heroStrip: {
    taglineNum: "01",
    taglineBody:
      "Building <em>quiet systems</em> &amp; intelligent agents for teams who care about the second order of effects.",
    focus: "Systems · Agents · Backend",
    available: "Q2 2026",
    currently: [
      { label: "SWE @ Google", meta: "'25—" },
      { label: "AI agents on Google ADK", meta: "now" },
      { label: "Browser-based VM access", meta: "shipped" },
    ],
    recent: [
      { label: "SDE @ Clear (ClearTax)", meta: "'24" },
      { label: "Imagine — AI image SaaS", meta: "'24" },
      { label: "ADK workshops · 200+ eng.", meta: "'25" },
    ],
    stack: [
      { label: "Python · Go · TypeScript", meta: "—" },
      { label: "FastAPI · Angular · React", meta: "—" },
      { label: "K8s · Vertex AI · Terraform", meta: "—" },
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
    status: "Available · Q3 2026",
    craft: "Designed & engineered, in Bengaluru · v6.0",
    copyright: "© 2026 Ketan Raj",
  },
  bentoData: {
    statement: "I build software that <em>disappears</em>",
    statementBody:
      "I grew up helping run a small family business — learned early that constraints create creativity. Today I apply the same thinking to software: limited time, limited compute, limited attention. Build clean systems within constraints.",
    philosophyTagline:
      "Software is mostly <em>typography</em> and time.<br/>Latency is a feature. The best abstraction is the one you delete.",
    philosophyBody:
      "Think in systems, not features. Complexity is a design smell. If a task is done twice manually, it should be code. Depth over trends.",
    nowText:
      "Filter coffee in hand. Sketching an <em>agent</em> orchestration spec.",
    nowUpdated: "Updated 06 min ago · auto",
    musicTitle: "Lofi for late commits — <em>monsoon mix vol. 4.</em>",
    musicMeta: "3'42\" / 7'18\" · headphones on",
    reelLabel: "Showreel · live",
    pullQuote:
      "Pay the <em>boring</em> debts first.<br/>The user's loading spinner is your résumé.",
    pullQuoteAttr: "— from a margin in a notebook",
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
      { name: "TypeScript", pct: "89%" },
      { name: "Python", pct: "62%" },
      { name: "Go", pct: "34%" },
      { name: "Postgres", pct: "71%" },
      { name: "Java / Spring", pct: "44%" },
      { name: "LLM tooling", pct: "31%" },
    ],
    soundtrack: [
      { title: "Sostre — Quietude", meta: "Ambient · 2024" },
      { title: "The Necks — Three", meta: "Jazz · 2020" },
      { title: "Floating Points — Promises", meta: "Modern classical · 2021" },
    ],
    gear: [
      { name: 'MacBook Pro 14"', ds: "M3 · daily driver" },
      { name: "Mechanical keyboard", ds: "Keychron · Brown" },
      { name: "External monitor", ds: '27" 4K · matte' },
      { name: "Filter coffee", ds: "South Indian, always" },
      { name: "Black notebook", ds: "Dotted · always open" },
      { name: "Wired earphones", ds: "OnePlus · 8 yrs" },
      { name: "Whiteboard", ds: "For thinking out loud" },
      { name: "Terminal", ds: "Warp · zsh · vim" },
    ],
  },
  workInfo: {
    shippingStartYear: 2021,
    ledeShort: "Selected · 2021 — Now",
    ledeLong:
      "Roles, internships, and independent stints — what I've worked on, with whom, and what I shipped. Tap any row for the bullet-point version.",
    ctaHeadline: ["Currently", "booking", "Q3."],
  },
  experience: EXPERIENCE,
  projects: PROJECTS,
  archive: ARCHIVE,
  featured: FEATURED,
  footerData: {
    tagline: "Just an ordinary Developer",
    footerNote: "From India with pride",
  },
  LoaderData: {
    loadingText: "Loading",
  },
  MainNavbarData: {
    navItems: [  
      { number: "01", label: "About" },
      { number: "02", label: "Projects" },
      { number: "03", label: "Agent Office" },
      { number: "04", label: "Experience" },
      { number: "05", label: "Contact" },
      { number: "", label: "© 2026" },
    ],
  },
  TopBarData: {
    topBarNickname: "Raaz",
    topBarFolioVersion: "Folio v.6.0",
  },
  AboutPageData: {
    positioning: {
      statement: "I build systems that reduce human effort.",
      subStatement: "I’m interested in leverage — automation, intelligent agents, and backend architecture that scales cleanly.",
      focus: "I care more about correctness and efficiency than buzzwords.",
    },
    philosophy: {
      heading: "Engineering Philosophy",
      principles: [
        {
          title: "Think in Systems, Not Features",
          description: "I don’t optimize screens. I optimize flows and constraints.",
        },
        {
          title: "Complexity Is a Design Smell",
          description: "If something needs explanation, it’s probably poorly structured.",
        },
        {
          title: "Automate Repetition",
          description: "If a task is done twice manually, it should be code.",
        },
        {
          title: "Depth Over Trends",
          description: "I prefer understanding databases, networking, and algorithms deeply rather than chasing frameworks.",
        },
      ],
    },
    background: {
      heading: "Background",
      narrative: "I grew up helping run a small family business. During peak seasons, I learned early that constraints create creativity. Today, I apply the same thinking to software - limited time, limited compute, limited attention. Build clean systems within constraints.",
      videos: [
        { src: "src/assets/BC.jpeg", caption: "Hackathon Win" },
        { src: "src/assets/HC1.jpeg", caption: "Badminton Tournament" },
        { src: "src/assets/HC2.jpeg", caption: "Public Speaking" },
      ],
    },
    explorations: {
      heading: "Currently Exploring",
      items: [
        "Agent-based systems (LLM orchestration, ADK)",
        "Database-first application design",
        "Distributed systems fundamentals",
        "High-performance data flows",
        "Automation tooling",
      ],
    },
    workingWithMe: {
      heading: "How I Work",
      items: [
        "I prefer writing before coding.",
        "I question assumptions.",
        "I optimize for long-term maintainability.",
        "I don’t ship hacks unless time explicitly demands it.",
      ],
    },
    ambition: {
      text: "Long term, I want to build software that removes friction from complex human processes.",
    },
  },
  ProjectsPageData: {
    categories: [
      {
        id: "web",
        name: "Web Apps",
        icon: "🌐",
        color: "#3b82f6",
        projects: [
          {
            id: "web-1",
            name: "E-Commerce Platform",
            description: "Full-stack e-commerce solution with real-time inventory management, payment integration, and admin dashboard.",
            tech: ["React", "Node.js", "MongoDB", "Stripe"],
            liveLink: "https://example.com",
            sourceCode: "https://github.com/example/ecommerce",
            color: "#3b82f6",
          },
          {
            id: "web-2",
            name: "Task Manager Pro",
            description: "Collaborative task management tool with real-time updates, team workspaces, and analytics.",
            tech: ["Next.js", "PostgreSQL", "Prisma", "WebSocket"],
            liveLink: "https://example.com",
            sourceCode: "https://github.com/example/taskmanager",
            color: "#8b5cf6",
          },
        ],
      },
      {
        id: "ai",
        name: "AI & ML",
        icon: "🤖",
        color: "#ec4899",
        projects: [
          {
            id: "ai-1",
            name: "Smart Assistant",
            description: "AI-powered personal assistant with natural language processing and task automation capabilities.",
            tech: ["Python", "OpenAI", "FastAPI", "Redis"],
            liveLink: "https://example.com",
            sourceCode: "https://github.com/example/assistant",
            color: "#ec4899",
          },
          {
            id: "ai-2",
            name: "Image Recognition API",
            description: "RESTful API for image classification and object detection using deep learning models.",
            tech: ["TensorFlow", "Flask", "Docker", "AWS"],
            sourceCode: "https://github.com/example/image-api",
            color: "#f59e0b",
          },
        ],
      },
      {
        id: "mobile",
        name: "Mobile Apps",
        icon: "📱",
        color: "#10b981",
        projects: [
          {
            id: "mobile-1",
            name: "Fitness Tracker",
            description: "Cross-platform fitness app with workout tracking, nutrition logging, and progress analytics.",
            tech: ["React Native", "Firebase", "Redux", "Expo"],
            liveLink: "https://example.com",
            sourceCode: "https://github.com/example/fitness",
            color: "#10b981",
          },
        ],
      },
      {
        id: "tools",
        name: "Dev Tools",
        icon: "🛠️",
        color: "#f97316",
        projects: [
          {
            id: "tools-1",
            name: "Code Snippet Manager",
            description: "Desktop app for organizing and searching code snippets with syntax highlighting and tagging.",
            tech: ["Electron", "TypeScript", "SQLite", "Monaco"],
            sourceCode: "https://github.com/example/snippets",
            color: "#f97316",
          },
          {
            id: "tools-2",
            name: "API Testing Suite",
            description: "Comprehensive API testing tool with automated test generation and performance monitoring.",
            tech: ["Go", "Vue.js", "PostgreSQL", "Docker"],
            liveLink: "https://example.com",
            sourceCode: "https://github.com/example/api-tester",
            color: "#06b6d4",
          },
        ],
      },
    ],
  },
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
