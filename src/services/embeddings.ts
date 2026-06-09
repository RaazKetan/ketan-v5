/* Thin client for the /api/embed proxy (Gemini text-embedding-004) plus the
   vector math the RAG needs. Talks only to our own origin, so the strict CSP
   (connect-src 'self') is untouched. Returns null on any failure so callers
   can fall back to keyword retrieval. */

/* Circuit breaker: once /api/embed fails (no key, depleted credits, network),
   stop calling it for the rest of the session. The agent then runs purely on
   keyword retrieval instead of hammering a dead endpoint with 502s on every
   message. Resets on page reload. */
let embeddingsDisabled = false;

export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  if (!texts.length) return [];
  if (embeddingsDisabled) return null;
  try {
    const res = await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });
    if (!res.ok) {
      embeddingsDisabled = true;
      return null;
    }
    const data = (await res.json()) as { embeddings?: number[][] };
    if (!Array.isArray(data.embeddings) || data.embeddings.length !== texts.length) {
      embeddingsDisabled = true;
      return null;
    }
    return data.embeddings;
  } catch {
    embeddingsDisabled = true;
    return null;
  }
}

/* Cosine similarity. Gemini vectors aren't guaranteed unit-length, so we
   normalize on the fly rather than assuming a dot product suffices. */
export function cosineSim(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
