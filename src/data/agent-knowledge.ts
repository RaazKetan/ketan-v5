/* The agent's knowledge base, authored as a plain Markdown document
   (agent-knowledge.md). Each "## " section there becomes one retrievable
   chunk here. Work-only content — no personal contact info lives in the doc;
   contact requests are caught by isContactIntent() and redirected to /contact.

   To change what the agent knows, edit agent-knowledge.md — not this file. */

import doc from "@/data/agent-knowledge.md?raw";

export type AgentDoc = {
  id: string;     // slug of the heading — "contact-policy" is referenced by name
  topic: string;  // the "## " heading text
  body: string;   // the prose under it
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* Split the doc into one chunk per "## " heading. Anything before the first
   "## " (the title + authoring note) is ignored. */
function parseDoc(md: string): AgentDoc[] {
  return md
    .split(/^##\s+/m)
    .slice(1)
    .map((section) => {
      const nl = section.indexOf("\n");
      const topic = (nl === -1 ? section : section.slice(0, nl)).trim();
      const body = (nl === -1 ? "" : section.slice(nl + 1)).trim();
      return { id: slugify(topic), topic, body };
    })
    .filter((d) => d.id && d.body);
}

export const AGENT_KNOWLEDGE: AgentDoc[] = parseDoc(doc);

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
