import { guard, json, getSarvamKey } from "./_shared";

export const config = { runtime: "edge" };

/* Allow-list of speaker IDs we expose. Anything else falls back to default. */
const SPEAKERS = new Set([
  "shubh", "varun", "anushka", "manisha", "arvind", "vidya", "arya",
]);

const MAX_TEXT_LEN = 500;

export default async function handler(req: Request): Promise<Response> {
  const blocked = guard(req);
  if (blocked) return blocked;

  let body: { text?: string; speaker?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const rawText = typeof body.text === "string" ? body.text : "";
  const text = rawText.slice(0, MAX_TEXT_LEN).trim();
  if (!text) return json({ error: "Empty text" }, 400);

  const speaker =
    body.speaker && SPEAKERS.has(body.speaker) ? body.speaker : "shubh";

  const key = getSarvamKey();
  if (!key) return json({ error: "Server not configured" }, 503);

  const upstream = await fetch("https://api.sarvam.ai/text-to-speech/stream", {
    method: "POST",
    headers: {
      "api-subscription-key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      target_language_code: "en-IN",
      speaker,
      model: "bulbul:v3",
      pace: 0.97,
      speech_sample_rate: 48000,
      output_audio_codec: "mp3",
      enable_preprocessing: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    return json({ error: "Upstream failure", status: upstream.status, detail: errText.slice(0, 200) }, 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
