/* Work experience entries for the /work page.
   TODO(Ketan): edit company names, dates, and bullets to match your actual
   roles. Bullets render as a dropdown when the row is clicked. */

export type Experience = {
  slug: string;
  role: string;
  company: string;
  location: string;
  year: string;       // short year/range shown on the row, e.g. "2025 — Now"
  yearStart: string;  // long range used in expanded view, e.g. "Jan 2025"
  yearEnd: string;    // e.g. "Present"
  summary: string;    // one-line tagline shown collapsed
  bullets: string[];  // bullet points shown when expanded
  stack: string[];
  link?: string;
};

export const EXPERIENCE: Experience[] = [
  {
    slug: "google",
    role: "Software Engineer",
    company: "Google",
    location: "Bengaluru, IN",
    year: "2025 — Now",
    yearStart: "2025",
    yearEnd: "Present",
    summary:
      "Building agent-driven systems and backend infrastructure at scale.",
    bullets: [
      "Designing agent orchestration patterns on Google's ADK for production workflows.",
      "Owning backend services with a focus on correctness, observability, and latency.",
      "Reducing manual ops by automating internal review and validation pipelines.",
      "Mentoring early-career engineers on systems thinking and code review.",
    ],
    stack: ["Python", "Go", "Google ADK", "Postgres"],
  },
  {
    slug: "swe-intern",
    role: "Software Engineering Intern",
    company: "Google",
    location: "Bengaluru, IN",
    year: "2024",
    yearStart: "May 2024",
    yearEnd: "Aug 2024",
    summary:
      "Backend services intern — shipped agent tooling that turned into the full-time charter.",
    bullets: [
      "Built and shipped an internal agent tooling proof-of-concept used by the team.",
      "Wrote the design doc that led to the larger production rollout.",
      "Worked across infra, application, and review surfaces — end-to-end ownership.",
    ],
    stack: ["Python", "Java", "Spanner"],
  },
  {
    slug: "freelance",
    role: "Freelance Engineer",
    company: "Independent",
    location: "Remote",
    year: "2022 — 2024",
    yearStart: "2022",
    yearEnd: "2024",
    summary:
      "Built full-stack apps and AI-powered products for early-stage clients.",
    bullets: [
      "Shipped Imagine — Next.js AI image studio with auth, payments, and gallery.",
      "Delivered ReadmeEditor, LuxeLenses, PerkPass — production-grade web apps.",
      "Owned the full stack: design system, API, database, and deployment.",
    ],
    stack: ["Next.js", "TypeScript", "Firebase", "MongoDB", "Stripe"],
  },
  {
    slug: "campus",
    role: "Open Source · Hackathons · Campus",
    company: "Chandigarh University",
    location: "Mohali, IN",
    year: "2021 — 2024",
    yearStart: "2021",
    yearEnd: "2024",
    summary:
      "Hackathon wins, public-speaking, DSA grind, and dozens of small shipped projects.",
    bullets: [
      "Built 70+ public repos across React, Three.js, Flutter, C++ DSA, and CSS playgrounds.",
      "Won hackathons and competed in CodeChef / CSES coding challenges.",
      "Spoke at campus events on engineering, AI, and shipping side projects.",
    ],
    stack: ["JavaScript", "C++", "React", "Three.js"],
  },
];
