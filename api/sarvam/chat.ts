import { guard, json, getSarvamKey } from "./_shared";

export const config = { runtime: "edge" };

/* RAG generation proxy. Takes the user's question + retrieved knowledge-base
   context (assembled client-side) and asks Sarvam's sarvam-m model to write a
   grounded, conversational answer. The key never leaves the server.

   Guardrails live in the system prompt AND upstream of it: the client already
   short-circuits contact-intent questions to the /contact redirect, so the
   model is told to never volunteer personal contact details either way. */

const MAX_QUESTION = 800;
const MAX_CONTEXT = 8000;
const MAX_HISTORY = 6;
const MAX_TURN_CHARS = 1000;

type Turn = { role?: string; text?: string };

function systemPrompt(context: string): string {
  return [
    "You are the portfolio agent for Ketan Raj, a software engineer.",
    "Answer visitor questions about Ketan using ONLY the context below.",
    "",
    "Rules:",
    "- Be concise and conversational: 1-3 short sentences. No markdown headings or long bullet lists.",
    '- Refer to Ketan in the third person ("Ketan...").',
    "- Use ONLY facts present in the context. If the answer isn't there, say you don't have that detail and offer what you can cover (his work at Google or Emergent, his projects, his stack, or his writing).",
    "- Never invent employers, dates, metrics, or links.",
    "- Never share personal contact details (email, phone, social handles). If asked how to reach him, point to the Contact page on this site.",
    "",
    "Context:",
    context || "(no context retrieved)",
  ].join("\n");
}

export default async function handler(req: Request): Promise<Response> {
  const blocked = guard(req);
  if (blocked) return blocked;

  let body: { question?: string; context?: string; history?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const question =
    (typeof body.question === "string" ? body.question : "").slice(0, MAX_QUESTION).trim();
  if (!question) return json({ error: "Empty question" }, 400);

  const context = (typeof body.context === "string" ? body.context : "").slice(0, MAX_CONTEXT);

  const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : [];
  const historyMsgs = history
    .filter((t) => t && typeof t.text === "string" && t.text.trim())
    .map((t) => ({
      role: t.role === "user" ? ("user" as const) : ("assistant" as const),
      content: String(t.text).slice(0, MAX_TURN_CHARS),
    }));

  const key = getSarvamKey();
  if (!key) return json({ error: "Server not configured" }, 503);

  const messages = [
    { role: "system", content: systemPrompt(context) },
    ...historyMsgs,
    { role: "user", content: question },
  ];

  let upstream: Response;
  try {
    upstream = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        /* Send both auth styles — the /v1 endpoint is OpenAI-compatible
           (Bearer) while Sarvam's native APIs use api-subscription-key. */
        Authorization: `Bearer ${key}`,
        "api-subscription-key": key,
      },
      body: JSON.stringify({
        model: "sarvam-30b",
        messages,
        temperature: 0.3,
        /* sarvam-30b is a reasoning model: it spends tokens on hidden
           reasoning_content before emitting the final answer. A small cap
           gets entirely consumed by reasoning (finish_reason "length",
           empty content), so give it real headroom. */
        max_tokens: 2048,
      }),
    });
  } catch (e) {
    return json({ error: "Upstream unreachable", detail: String(e).slice(0, 200) }, 502);
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    console.error("[sarvam chat] upstream", upstream.status, errText.slice(0, 400));
    return json({ error: "Upstream failure", status: upstream.status, detail: errText.slice(0, 400) }, 502);
  }

  const data = (await upstream.json().catch(() => null)) as
    | { choices?: { message?: { content?: string } }[] }
    | null;
  const answer = (data?.choices?.[0]?.message?.content || "").trim();
  if (!answer) return json({ error: "Empty answer" }, 502);

  return json({ answer }, 200, { "Cache-Control": "no-store" });
}
