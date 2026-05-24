import { guard, json, getSarvamKey } from "./_shared";

export const config = { runtime: "edge" };

const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_AUDIO_MIME = /^audio\/(webm|mp4|mpeg|wav|x-wav|ogg)/i;

export default async function handler(req: Request): Promise<Response> {
  const blocked = guard(req);
  if (blocked) return blocked;

  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > MAX_AUDIO_BYTES) {
    return json({ error: "Audio too large" }, 413);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Expected multipart/form-data" }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Missing audio file" }, 400);
  if (file.size > MAX_AUDIO_BYTES) return json({ error: "Audio too large" }, 413);
  if (file.type && !ALLOWED_AUDIO_MIME.test(file.type)) {
    return json({ error: "Unsupported audio type" }, 415);
  }

  const key = getSarvamKey();
  if (!key) return json({ error: "Server not configured" }, 503);

  /* Try saarika:v2.5 first (Sarvam's current flagship STT for Indian
     languages); fall back to saarika:v2 if Sarvam returns a model error. */
  const tryModel = async (model: string) => {
    const f = new FormData();
    f.append("file", file);
    f.append("model", model);
    f.append("language_code", "en-IN");
    return fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": key },
      body: f,
    });
  };

  let upstream = await tryModel("saarika:v2.5");
  if (!upstream.ok && upstream.status === 400) {
    upstream = await tryModel("saarika:v2");
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    console.error("[sarvam stt] upstream", upstream.status, errText.slice(0, 500));
    return json(
      { error: "Upstream failure", status: upstream.status, detail: errText.slice(0, 400) },
      502
    );
  }

  const data = await upstream.json().catch(() => null);
  if (!data || typeof data.transcript !== "string") {
    return json({ transcript: "" });
  }
  return json({ transcript: data.transcript });
}
