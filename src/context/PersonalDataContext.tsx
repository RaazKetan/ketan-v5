import React, { createContext, useContext } from "react";

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

export type PersonalData = {
  heroTitle: HeroTitleProps;
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
    location: "India",
    aboutP1:
      "Ketan Raj (He/Him) AKA Raaz is a Software Engineer from Gaya, Bihar, India.",
    aboutP2:
      "Passionate about building innovative solutions and solving complex problems.",
  },
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
      { number: "", label: "© 2025" },
    ],
  },
  TopBarData: {
    topBarNickname: "Raaz",
    topBarFolioVersion: "Folio v.5",
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
      narrative: "I grew up helping run a small family business. During peak seasons, I learned early that constraints create creativity. Today, I apply the same thinking to software — limited time, limited compute, limited attention. Build clean systems within constraints.",
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
