/* Work experience entries for the /work page.
   Source: KetanRaj_SWE_Resume.pdf. Update bullets here when the resume changes. */

export type Experience = {
  slug: string;
  role: string;
  company: string;
  location: string;
  year: string;       // short year/range shown on the row, e.g. "2025 - Now"
  yearStart: string;  // long range used in expanded view, e.g. "Apr 2025"
  yearEnd: string;    // e.g. "Present"
  summary: string;    // one-line tagline shown collapsed
  bullets: string[];  // bullet points shown when expanded
  stack: string[];
  link?: string;
};

export const EXPERIENCE: Experience[] = [
  {
    slug: "emergent",
    role: "Software Engineer",
    company: "Emergent",
    location: "Bengaluru, IN",
    year: "2026 - Now",
    yearStart: "2026",
    yearEnd: "Present",
    summary:
      "Building agent-first systems and intelligent backends - pushing the same agentic loops I shipped at Google into the next product surface.",
    bullets: [
      "Owning agent orchestration and backend systems for the core product.",
      "Designing end-to-end agentic loops - planning, tool use, structured memory - that ship to real users.",
      "Carrying lessons forward from Google ADK production work: human-in-the-loop safeguards, observability, deterministic recovery.",
    ],
    stack: ["Python", "TypeScript", "LLMs", "Agents", "Postgres"],
  },
  {
    slug: "google",
    role: "Software Engineer (ex-Google)",
    company: "Google",
    location: "Bengaluru, IN",
    year: "2025",
    yearStart: "Apr 2025",
    yearEnd: "2026",
    summary:
      "Built agent systems and secure-access infrastructure for production debugging at scale.",
    bullets: [
      "Designed and deployed a secure browser-based VM access platform that lets engineers debug production infrastructure without direct SSH.",
      "Architected a Go WebSocket relay on Kubernetes that bridges browser WSS traffic to TCP VNC servers for scalable remote console access.",
      "Shipped an Angular + noVNC browser console interface that replaced manual CLI workflows and improved operational accessibility by 100%.",
      "Engineered 18+ AI agent systems on Google ADK, FastAPI, and Vertex AI to automate NOC alert investigation pipelines - reducing manual triage by ~40%.",
      "Created Dev0, an AI-driven infrastructure orchestration platform that integrates Terraform + CI/CD for automated provisioning.",
      "Implemented Human-in-the-Loop safeguards to prevent destructive infrastructure mutations in automated deployments.",
      "Authored Google ADK + GCP deployment documentation that cut team onboarding time by 50% and errors by 15%.",
    ],
    stack: ["Go", "Python", "Angular", "Google ADK", "FastAPI", "Vertex AI", "Kubernetes", "Terraform"],
  },
  {
    slug: "clear",
    role: "Software Developer",
    company: "Clear (ClearTax)",
    location: "Bengaluru, IN",
    year: "2024 - 2025",
    yearStart: "Jul 2024",
    yearEnd: "Mar 2025",
    summary:
      "Frontend modules for tax workflows - engagement, validation, and page-load wins.",
    bullets: [
      "Built the Tax Savings Deductions module in React, Tailwind, and TypeScript with structured financial input validation.",
      "Drove a 30% lift in product engagement and a 40% drop in incorrect tax submissions through improved validation workflows.",
      "Spearheaded a full rewrite of the Loans Summary module using React + TypeScript, enabling adaptive display of deduction categories and cutting page load time by 50%.",
      "Implemented real-time updates, edit/remove workflows, and an incremental form architecture.",
      "Optimized frontend rendering pipelines to improve interaction speed by 40%.",
    ],
    stack: ["React", "TypeScript", "Tailwind", "Jest"],
  },
  {
    slug: "imagine",
    role: "Founder · Solo Engineer",
    company: "Imagine",
    location: "Remote",
    year: "2024",
    yearStart: "2024",
    yearEnd: "2024",
    summary:
      "Scalable AI image SaaS - Next.js + MongoDB + Stripe, 2000+ daily transformations, 99.9% uptime.",
    bullets: [
      "Built a scalable SaaS platform on Next.js, MongoDB, and Tailwind.",
      "Integrated Cloudinary for image processing, Stripe for payments, and Clerk for authentication.",
      "Handled 2000+ daily image transformations at 99.9% uptime.",
    ],
    stack: ["Next.js", "MongoDB", "Tailwind", "Stripe", "Clerk", "Cloudinary", "Vercel"],
    link: "https://github.com/RaazKetan/imagine",
  },
  {
    slug: "achievements",
    role: "Hackathons · Workshops · Open Source",
    company: "Chandigarh University & Independent",
    location: "Mohali / Remote",
    year: "2020 - 2024",
    yearStart: "Aug 2020",
    yearEnd: "Jul 2024",
    summary:
      "B.E. Computer Science · CGPA 7.94 · hackathon podiums and Google ADK workshops.",
    bullets: [
      "B.E. Computer Science Engineering at Chandigarh University - CGPA 7.94.",
      "Led technical workshops on Google ADK for 200+ engineers and partners (TCS, Wipro, HCL).",
      "2nd place - LGBTQ+ community app/website category at Hack the Mountain Hackathon.",
      "3rd place - Clear hackathon for seamless Slack UI integrations.",
      "70+ public repos on GitHub spanning React, Three.js, Flutter, C++ DSA, and Python AI agents.",
      "Certifications: AWS Cloud Technical Essentials, Web Development, Software Testing.",
    ],
    stack: ["JavaScript", "C++", "Python", "React", "Three.js"],
  },
];
