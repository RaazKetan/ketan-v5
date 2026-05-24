/* Lightweight RAG over Ketan's portfolio data.
   No vector store — uses keyword scoring against PersonalDataContext +
   experience + projects. Good enough for a portfolio Q&A bot. */

import type { PersonalData } from "../context/PersonalDataContext";

export type RagChunk = {
  id: string;
  title: string;
  body: string;
  source: string;
};

export function buildKnowledgeBase(data: PersonalData): RagChunk[] {
  const chunks: RagChunk[] = [];

  const { heroTitle, bentoData, contactInfo, experience, projects } = data;

  chunks.push({
    id: "bio",
    title: "Bio",
    body: `${heroTitle.name} is a ${heroTitle.title} at ${heroTitle.company}, based in ${heroTitle.location}. ${heroTitle.aboutP1} ${heroTitle.aboutP2}`,
    source: "Bio",
  });

  chunks.push({
    id: "philosophy",
    title: "Philosophy",
    body: `${bentoData.statement} ${bentoData.statementBody} ${bentoData.philosophyTagline.replace(/<[^>]+>/g, "")} ${bentoData.philosophyBody}`,
    source: "About",
  });

  chunks.push({
    id: "contact",
    title: "Contact",
    body: `Reach Ketan at ${contactInfo.email}, on GitHub ${contactInfo.github}, Medium ${contactInfo.medium}, LinkedIn ${contactInfo.linkedin}, or book a 30-minute Topmate call at ${contactInfo.topmate}. Based in ${contactInfo.locationLong}, timezone ${contactInfo.timezone}.`,
    source: "Contact",
  });

  experience.forEach((e) => {
    chunks.push({
      id: `exp-${e.slug}`,
      title: `${e.role} at ${e.company}`,
      body: `${e.role} at ${e.company} (${e.yearStart} — ${e.yearEnd}) in ${e.location}. ${e.summary} ${e.bullets.join(" ")} Stack: ${e.stack.join(", ")}.`,
      source: `Experience · ${e.company}`,
    });
  });

  projects.forEach((p) => {
    chunks.push({
      id: `proj-${p.slug}`,
      title: p.name,
      body: `${p.name} (${p.yearRange}) — ${p.short} ${p.long} Role: ${p.role} at ${p.org}. Tech: ${p.tech.join(", ")}.${p.live ? ` Live: ${p.live}.` : ""} Repo: ${p.repo}.`,
      source: `Project · ${p.name}`,
    });
  });

  return chunks;
}

/* Tokenize + score chunks by overlap with the query terms. */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "what", "who", "how", "when", "where", "why",
  "did", "does", "your", "you", "are", "was", "were", "has", "have",
  "this", "that", "from", "about", "tell", "more", "give", "show", "any",
]);

export function retrieve(
  query: string,
  kb: RagChunk[],
  k = 4
): RagChunk[] {
  const qTokens = tokenize(query).filter((t) => !STOPWORDS.has(t));
  if (!qTokens.length) return kb.slice(0, k);

  const scored = kb.map((chunk) => {
    const bodyTokens = tokenize(chunk.title + " " + chunk.body);
    let score = 0;
    for (const qt of qTokens) {
      for (const bt of bodyTokens) {
        if (bt === qt) score += 2;
        else if (bt.startsWith(qt) || qt.startsWith(bt)) score += 1;
      }
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.chunk);
}

/* Compose a short answer from the retrieved chunks. Keeps it deterministic
   (no LLM needed) — quotes from the source chunks directly. */
export function composeAnswer(_query: string, chunks: RagChunk[]): string {
  if (!chunks.length) {
    return "I don't have that detail on hand — try asking about Ketan's experience at Google or Clear, his projects (Origin, Imagine, Reublic), or how to get in touch.";
  }
  const lead = chunks[0];
  // Take the first 2 sentences of the top chunk
  const sentences = lead.body.split(/(?<=[.!?])\s+/).slice(0, 3);
  const main = sentences.join(" ");

  if (chunks.length === 1) return main;
  const others = chunks.slice(1, 3).map((c) => c.title).join(", ");
  return `${main} (See also: ${others}.)`;
}
