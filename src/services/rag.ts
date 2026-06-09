/* Lightweight RAG over the curated agent knowledge document.
   No vector store — keyword scoring over AGENT_KNOWLEDGE (work-only data,
   not the personal PersonalDataContext). Contact-intent queries are
   handled separately to avoid leaking personal info. */

import { AGENT_KNOWLEDGE, isContactIntent } from "@/data/agent-knowledge";

export type RagChunk = {
  id: string;
  title: string;
  body: string;
  source: string;
};

/* Build the agent's KB from the curated work-only document.
   Signature kept compatible (data arg ignored) so existing callers don't
   need to change. */
export function buildKnowledgeBase(_data?: unknown): RagChunk[] {
  return AGENT_KNOWLEDGE.map((d) => ({
    id: d.id,
    title: d.topic,
    body: d.body,
    source: d.topic,
  }));
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
  "can", "could", "would", "should", "his", "him", "her",
]);

export function retrieve(query: string, kb: RagChunk[], k = 3): RagChunk[] {
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

/* Compose a short answer from the retrieved chunks. Includes a hard
   redirect when the query is asking for contact info — the agent never
   leaks email / phone / DMs, only points to /contact. */
export function composeAnswer(query: string, chunks: RagChunk[]): string {
  /* Contact-intent short-circuit. Always wins over generic retrieval. */
  if (isContactIntent(query)) {
    const contactChunk = chunks.find((c) => c.id === "contact-policy");
    if (contactChunk) return contactChunk.body;
    return (
      "Head to the Contact page on this site — that's the right way to reach " +
      "Ketan. I won't share personal contact details in this chat."
    );
  }

  if (!chunks.length) {
    return (
      "I don't have that on hand. Try asking about Ketan's work at Google or " +
      "Emergent, his projects (Origin, Reublic, Imagine), his stack, or his " +
      "writing on Medium."
    );
  }

  /* Take the first 2-3 sentences of the top chunk. */
  const lead = chunks[0];
  const sentences = lead.body.split(/(?<=[.!?])\s+/).slice(0, 3);
  return sentences.join(" ");
}
