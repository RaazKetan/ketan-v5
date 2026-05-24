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

  const sarvamForm = new FormData();
  sarvamForm.append("file", file);
  sarvamForm.append("model", "saarika:v2");
  sarvamForm.append("language_code", "en-IN");
  sarvamForm.append("with_timestamps", "false");

  const upstream = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": key },
    body: sarvamForm,
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return json(
      { error: "Upstream failure", status: upstream.status, detail: errText.slice(0, 200) },
      502
    );
  }

  const data = await upstream.json().catch(() => null);
  if (!data || typeof data.transcript !== "string") {
    return json({ transcript: "" });
  }
  return json({ transcript: data.transcript });
}
