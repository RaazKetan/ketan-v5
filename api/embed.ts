import { guard, json, getGeminiKey } from "./sarvam/_shared";

export const config = { runtime: "edge" };

/* Embeddings proxy. Batch-embeds short texts via Gemini text-embedding-004
   (768-dim) and returns the raw vectors. The API key never leaves the server;
   abuse is bounded by the shared origin check + rate limit in _shared.

   Used by the agent's RAG: document vectors are embedded once (and cached
   client-side), and each user query is embedded per turn for semantic search.
   All calls are same-origin (/api/embed), so the site's strict CSP
   (connect-src 'self') keeps working with no host additions. */

const MODEL = "gemini-embedding-001";
const MAX_TEXTS = 32;     // KB is ~20 docs; one batch covers docs + headroom
const MAX_CHARS = 4000;   // per-text cap (the longest KB doc is well under this)

export default async function handler(req: Request): Promise<Response> {
  const blocked = guard(req);
  if (blocked) return blocked;

  let body: { texts?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const raw = Array.isArray(body.texts) ? body.texts : [];
  const texts = raw
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.slice(0, MAX_CHARS).trim())
    .filter(Boolean)
    .slice(0, MAX_TEXTS);

  if (!texts.length) return json({ error: "No texts to embed" }, 400);

  const key = getGeminiKey();
  if (!key) return json({ error: "Server not configured" }, 503);

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}` +
    `:batchEmbedContents?key=${encodeURIComponent(key)}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${MODEL}`,
          content: { parts: [{ text }] },
        })),
      }),
    });
  } catch (e) {
    return json({ error: "Upstream unreachable", detail: String(e).slice(0, 200) }, 502);
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    console.error("[embed] upstream", upstream.status, errText.slice(0, 400));
    return json({ error: "Upstream failure", status: upstream.status, detail: errText.slice(0, 400) }, 502);
  }

  const data = (await upstream.json().catch(() => null)) as
    | { embeddings?: { values?: number[] }[] }
    | null;
  const embeddings = (data?.embeddings ?? [])
    .map((e) => e.values)
    .filter((v): v is number[] => Array.isArray(v));

  if (embeddings.length !== texts.length) {
    console.error("[embed] count mismatch", embeddings.length, "vs", texts.length);
    return json({ error: "Embedding count mismatch" }, 502);
  }

  return json({ embeddings }, 200, { "Cache-Control": "no-store" });
}
