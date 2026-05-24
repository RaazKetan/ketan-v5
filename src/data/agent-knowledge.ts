/* Standalone knowledge document the AI agent answers from.
   Curated work-only content — NOT pulled from PersonalDataContext.
   No personal contact info (email, phone, address, DMs) lives here.
   If the visitor asks how to reach Ketan, the agent redirects them
   to /contact instead of leaking anything. */

export type AgentDoc = {
  id: string;
  topic: string;
  body: string;
  /* Optional aliases — extra search terms a user might use. */
  aliases?: string[];
};

/* ----- Identity (work-only) ---------------------------------------- */
const IDENTITY: AgentDoc[] = [
  {
    id: "who",
    topic: "Who Ketan is",
    aliases: ["about", "intro", "bio", "ketan", "yourself"],
    body:
      "Ketan Raj is a Software Engineer at Emergent (YC24), previously at Google. " +
      "He builds AI agents and intelligent backends — agentic loops that ship to real " +
      "users and survive production. Based in Bengaluru, India.",
  },
  {
    id: "focus",
    topic: "Current focus",
    aliases: ["working on", "interested", "now"],
    body:
      "Ketan is currently focused on agentic AI systems: LLM orchestration, " +
      "tool use, structured memory, human-in-the-loop safeguards, and the " +
      "boring infrastructure that lets agents actually run in production.",
  },
];

/* ----- Roles -------------------------------------------------------- */
const ROLES: AgentDoc[] = [
  {
    id: "role-emergent",
    topic: "Software Engineer at Emergent (YC24)",
    aliases: ["emergent", "current job", "where works"],
    body:
      "Ketan is a Software Engineer at Emergent (Y Combinator 2024 batch), " +
      "joined in 2026. He owns agent orchestration and backend systems for the " +
      "core product — end-to-end agentic loops (planning, tool use, structured " +
      "memory) shipping to real users. He carries lessons forward from Google ADK " +
      "production work: HITL safeguards, observability, deterministic recovery.",
  },
  {
    id: "role-google",
    topic: "Software Engineer at Google (ex-Google)",
    aliases: ["google", "previous job", "ex-google", "noogler"],
    body:
      "Ketan was a Software Engineer at Google in Bengaluru from April 2025 to " +
      "early 2026. He designed and deployed a secure browser-based VM access " +
      "platform that lets engineers debug production infrastructure without direct " +
      "SSH. He architected a Go WebSocket relay on Kubernetes bridging browser " +
      "WSS traffic to TCP VNC servers, and shipped an Angular + noVNC console " +
      "interface that improved operational accessibility by 100%. He also engineered " +
      "18+ AI agent systems on Google ADK, FastAPI, and Vertex AI to automate NOC " +
      "alert investigation pipelines — reducing manual triage by ~40%. He built " +
      "Dev0, an AI-driven infrastructure orchestration platform integrating Terraform " +
      "with CI/CD pipelines, with Human-in-the-Loop safeguards preventing " +
      "destructive mutations. He authored Google ADK + GCP deployment documentation " +
      "that cut team onboarding time by 50% and errors by 15%.",
  },
  {
    id: "role-clear",
    topic: "Software Developer at Clear (ClearTax)",
    aliases: ["clear", "cleartax", "first job"],
    body:
      "Ketan was a Software Developer at Clear (formerly ClearTax) in Bengaluru " +
      "from July 2024 to March 2025. He built the Tax Savings Deductions module " +
      "in React, Tailwind, and TypeScript with structured financial input " +
      "validation — driving a 30% lift in product engagement and a 40% drop in " +
      "incorrect tax submissions. He spearheaded a rewrite of the Loans Summary " +
      "module in React + TypeScript, cutting page load time by 50%. He implemented " +
      "real-time updates, edit/remove workflows, and an incremental form " +
      "architecture, and optimized frontend rendering pipelines for a 40% " +
      "interaction-speed improvement.",
  },
];

/* ----- Projects ----------------------------------------------------- */
const PROJECT_DOCS: AgentDoc[] = [
  {
    id: "proj-origin",
    topic: "Origin — agentic AI hiring platform",
    aliases: ["origin", "hiring platform", "agentic hiring"],
    body:
      "Origin is a hiring platform run by agents. Candidates ship work; agents " +
      "read it, match it against real openings, and shortlist on substance. The " +
      "whole loop — sourcing, screening, scheduling — happens autonomously in the " +
      "background while you keep building. The bet: signal beats application " +
      "volume, and agents are good enough to find it. Built with Python, LLMs, " +
      "agent frameworks. Currently in development.",
  },
  {
    id: "proj-reublic",
    topic: "Reublic — revolutionary AI agent",
    aliases: ["reublic", "revolution", "planning agent"],
    body:
      "Reublic is an agent built for ambitious, multi-step workflows — research, " +
      "drafting, execution. Plans are explicit, intermediate state is " +
      "inspectable, and recovery is built in. The point is to make agentic work " +
      "auditable, not magic. Python, LLMs, planning.",
  },
  {
    id: "proj-imagine",
    topic: "Imagine — AI image studio",
    aliases: ["imagine", "image generation", "saas"],
    body:
      "Imagine is an end-to-end AI image studio: prompt → generation → gallery, " +
      "with credits and billing wired in. Full-stack Next.js with Clerk for " +
      "auth, Cloudinary for media, Stripe for payments, MongoDB for storage. " +
      "Handles 2000+ daily image transformations at 99.9% uptime. Live: " +
      "imagine-alpha.vercel.app.",
  },
];

/* ----- Writing / Blog ---------------------------------------------- */
const WRITING: AgentDoc[] = [
  {
    id: "blog-adk-streamlit",
    topic: "Essay: Build your Agent — Google ADK + Streamlit",
    aliases: ["adk", "streamlit", "blog", "essay", "medium"],
    body:
      "Ketan wrote a practical walk-through of wiring Google ADK agents into a " +
      "Streamlit UI — state, tool calls, and the smallest viable agentic chatbot " +
      "you can ship in an afternoon. Published on Medium.",
  },
  {
    id: "blog-dijkstra",
    topic: "Essay: 60-year-old algorithm dethroned",
    aliases: ["dijkstra", "algorithm", "graphs", "shortest path"],
    body:
      "Ketan's Medium piece (Aug 2025) on the 2025 algorithm that beat Dijkstra " +
      "on bounds we thought were optimal. Covers what changed and what it means " +
      "for graphs at scale.",
  },
  {
    id: "blog-monorepo",
    topic: "Essay: Why Google put billions of lines in one repo",
    aliases: ["monorepo", "polyrepo", "tooling"],
    body:
      "Ketan's Medium piece (Sep 2025) on mono-repo vs polyrepo — notes from " +
      "inside Google on how teams collaborate, refactor speed, and cross-project " +
      "change cost.",
  },
];

/* ----- Stack / Skills ---------------------------------------------- */
const STACK: AgentDoc[] = [
  {
    id: "stack-languages",
    topic: "Languages Ketan ships in",
    aliases: ["languages", "programming languages", "code"],
    body:
      "Python, TypeScript, Go, Java, JavaScript, SQL, HTML/CSS. Primary day-to-" +
      "day right now is Python and TypeScript.",
  },
  {
    id: "stack-ai",
    topic: "AI / ML stack",
    aliases: ["ai", "ml", "llm", "rag", "agents", "vertex"],
    body:
      "Generative AI agents, RAG, Google ADK, Vertex AI (Gemini), vector search, " +
      "prompt engineering, LangChain, FastAPI for serving.",
  },
  {
    id: "stack-frameworks",
    topic: "Frameworks & frontend tooling",
    aliases: ["react", "angular", "frameworks", "frontend"],
    body:
      "React, Angular, Next.js, Tailwind CSS, Streamlit, Jest. Frontend work is " +
      "TS-first with strong typing across the network boundary.",
  },
  {
    id: "stack-cloud",
    topic: "Cloud & DevOps",
    aliases: ["cloud", "devops", "kubernetes", "infra", "aws", "gcp"],
    body:
      "AWS, Google Cloud, Kubernetes, Docker, Terraform, Git. Comfortable with " +
      "production deployment, IaC, and observability.",
  },
];

/* ----- Education + Achievements ------------------------------------ */
const EXTRAS: AgentDoc[] = [
  {
    id: "education",
    topic: "Education",
    aliases: ["education", "college", "university", "degree"],
    body:
      "B.E., Computer Science Engineering from Chandigarh University " +
      "(August 2020 – July 2024), CGPA 7.94.",
  },
  {
    id: "achievements",
    topic: "Achievements",
    aliases: ["awards", "hackathon", "achievements", "wins", "talks"],
    body:
      "Led technical workshops on Google ADK for 200+ engineers and partners " +
      "(TCS, Wipro, HCL). 2nd place in the LGBTQ+ community app/website category " +
      "at Hack the Mountain Hackathon. 3rd place in the Clear hackathon for " +
      "seamless Slack UI integrations.",
  },
  {
    id: "certs",
    topic: "Certifications",
    aliases: ["certifications", "certs", "aws cert"],
    body:
      "AWS Cloud Technical Essentials, Web Development, Software Testing.",
  },
];

/* ----- Contact policy (no leak!) ----------------------------------- */
const CONTACT_REDIRECT: AgentDoc[] = [
  {
    id: "contact-policy",
    topic: "How to get in touch with Ketan",
    aliases: [
      "contact", "email", "phone", "number", "reach", "hire", "dm",
      "linkedin", "github", "twitter", "social", "address", "location",
      "book", "call", "talk", "meeting", "topmate",
    ],
    body:
      "Head to the Contact page on this site — that's the right way to reach " +
      "Ketan. It has the form, the calendar link, and his work-facing socials. " +
      "I won't share personal contact details directly in this chat.",
  },
];

export const AGENT_KNOWLEDGE: AgentDoc[] = [
  ...IDENTITY,
  ...ROLES,
  ...PROJECT_DOCS,
  ...WRITING,
  ...STACK,
  ...EXTRAS,
  ...CONTACT_REDIRECT,
];

/* Patterns that should always redirect to /contact rather than leak. */
const CONTACT_INTENT_PATTERNS = [
  /\b(email|e-?mail)\b/i,
  /\b(phone|number|mobile|whatsapp|whats app)\b/i,
  /\b(address|where (do|does) (he|you|ketan) live)\b/i,
  /\b(reach|contact|dm|message|hire|book|schedule)\b/i,
  /\b(linkedin|github|twitter|topmate|calendly)\b/i,
];

/* Returns true if the query is asking how to reach Ketan. */
export function isContactIntent(query: string): boolean {
  return CONTACT_INTENT_PATTERNS.some((rx) => rx.test(query));
}
