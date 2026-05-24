// src/Hooks/useGitHubRepos.ts
import { useState, useEffect } from "react";

export type RepoCategory = "frontend" | "backend" | "experimental";

export interface GitHubProject {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  category: RepoCategory;
  color: string;
  stargazers_count: number;
  updated_at: string;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Ruby: "#701516",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Dart: "#00b4ab",
};

const FRONTEND_LANGS = new Set([
  "TypeScript", "JavaScript", "CSS", "HTML", "Vue", "Svelte", "Dart",
]);
const BACKEND_LANGS = new Set([
  "Python", "Go", "Rust", "Java", "C#", "C++", "Ruby", "Shell", "Kotlin",
]);
const FRONTEND_TOPICS = new Set([
  "react", "nextjs", "vue", "svelte", "frontend", "ui", "css", "tailwind",
  "portfolio", "landing-page", "component", "web", "typescript", "javascript",
]);
const BACKEND_TOPICS = new Set([
  "backend", "api", "rest", "graphql", "database", "server", "fastapi",
  "express", "django", "flask", "nodejs", "python", "go", "rust", "microservice",
  "docker", "kubernetes", "devops", "cloud",
]);

function categorize(project: {
  language: string | null;
  topics: string[];
}): RepoCategory {
  const { language, topics } = project;

  // Check topics first (more explicit)
  const topicSet = new Set(topics.map((t) => t.toLowerCase()));
  let frontendScore = 0;
  let backendScore = 0;

  for (const t of topicSet) {
    if (FRONTEND_TOPICS.has(t)) frontendScore++;
    if (BACKEND_TOPICS.has(t)) backendScore++;
  }

  if (frontendScore > backendScore) return "frontend";
  if (backendScore > frontendScore) return "backend";

  // Fall back to language
  if (language) {
    if (FRONTEND_LANGS.has(language)) return "frontend";
    if (BACKEND_LANGS.has(language)) return "backend";
  }

  return "experimental";
}

function langColor(language: string | null): string {
  if (!language) return "#6b7280";
  return LANG_COLORS[language] ?? "#6b7280";
}

// Static fallback in case GitHub API is rate-limited
const FALLBACK_PROJECTS: GitHubProject[] = [
  {
    id: 1,
    name: "portfolio-v5",
    description: "Personal portfolio - interactive pixel office edition",
    html_url: "https://github.com/RaazKetan/portfolio-v5",
    homepage: null,
    language: "TypeScript",
    topics: ["react", "portfolio", "typescript"],
    category: "frontend",
    color: "#3178c6",
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "ai-agent",
    description: "LLM-powered multi-agent orchestration system",
    html_url: "https://github.com/RaazKetan/ai-agent",
    homepage: null,
    language: "Python",
    topics: ["python", "fastapi", "llm", "agent"],
    category: "backend",
    color: "#3572a5",
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "side-experiments",
    description: "Random experiments, proofs-of-concept and explorations",
    html_url: "https://github.com/RaazKetan",
    homepage: null,
    language: null,
    topics: [],
    category: "experimental",
    color: "#6b7280",
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  },
];

export function useGitHubRepos(username: string) {
  const [repos, setRepos] = useState<GitHubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRepos() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=30&sort=updated`,
          {
            headers: {
              Accept: "application/vnd.github.mercy-preview+json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`);
        }

        const data = await res.json();

        if (!cancelled) {
          const mapped: GitHubProject[] = (data as Array<{
            id: number;
            name: string;
            description: string | null;
            html_url: string;
            homepage: string | null;
            language: string | null;
            topics: string[];
            stargazers_count: number;
            updated_at: string;
            fork: boolean;
          }>)
            .filter((r) => !r.fork) // skip forks
            .slice(0, 24) // limit to 24 repos
            .map((r) => {
              const category = categorize({
                language: r.language,
                topics: r.topics ?? [],
              });
              return {
                id: r.id,
                name: r.name,
                description: r.description ?? "No description provided.",
                html_url: r.html_url,
                homepage: r.homepage && r.homepage !== "" ? r.homepage : null,
                language: r.language,
                topics: r.topics ?? [],
                category,
                color: langColor(r.language),
                stargazers_count: r.stargazers_count,
                updated_at: r.updated_at,
              };
            });

          setRepos(mapped.length > 0 ? mapped : FALLBACK_PROJECTS);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("GitHub API fetch failed, using fallback:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
          setRepos(FALLBACK_PROJECTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRepos();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return { repos, loading, error };
}
