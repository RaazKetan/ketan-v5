/* Sarvam AI API client — TTS (bulbul:v3 voice "varun") + STT (saarika).
   API key is read from VITE_SARVAM_API_KEY (set it in .env.local). */

const SARVAM_KEY = import.meta.env.VITE_SARVAM_API_KEY as string | undefined;
const TTS_URL = "https://api.sarvam.ai/text-to-speech";
const STT_URL = "https://api.sarvam.ai/speech-to-text";

export const sarvamConfigured = () => Boolean(SARVAM_KEY);

type TTSResponse = { audios: string[] };

/* Returns a playable Audio element. Sarvam returns base64-encoded
   audio chunks in the `audios` array — we decode and stitch them
   into a single Blob for playback. */
export async function sarvamSpeak(
  text: string,
  opts: { speaker?: string; pace?: number } = {}
): Promise<HTMLAudioElement | null> {
  if (!SARVAM_KEY) {
    console.warn("Sarvam: VITE_SARVAM_API_KEY not set");
    return null;
  }
  if (!text.trim()) return null;

  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      "api-subscription-key": SARVAM_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      text: text.slice(0, 500),
      target_language_code: "en-IN",
      speaker: opts.speaker ?? "varun",
      pace: opts.pace ?? 0.97,
      speech_sample_rate: 48000,
      enable_preprocessing: true,
      model: "bulbul:v3",
    }),
  });
  if (!res.ok) {
    console.error("Sarvam TTS failed", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as TTSResponse;
  if (!data.audios?.length) return null;

  // Decode base64 -> Uint8Array -> Blob -> object URL.
  const audioBytes = data.audios
    .map((b64) => {
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    })
    .reduce((acc, chunk) => {
      const merged = new Uint8Array(acc.length + chunk.length);
      merged.set(acc);
      merged.set(chunk, acc.length);
      return merged;
    }, new Uint8Array());
  const blob = new Blob([new Uint8Array(audioBytes)], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.addEventListener("ended", () => URL.revokeObjectURL(url));
  return audio;
}

type STTResponse = { transcript: string; language_code?: string };

/* Speech-to-text. Accepts a Blob (e.g. from MediaRecorder) and returns
   the transcribed string. Uses the saarika:v2 model with en-IN. */
export async function sarvamTranscribe(audioBlob: Blob): Promise<string> {
  if (!SARVAM_KEY) {
    console.warn("Sarvam: VITE_SARVAM_API_KEY not set");
    return "";
  }
  const form = new FormData();
  form.append("file", audioBlob, "audio.webm");
  form.append("model", "saarika:v2");
  form.append("language_code", "en-IN");
  form.append("with_timestamps", "false");

  const res = await fetch(STT_URL, {
    method: "POST",
    headers: { "api-subscription-key": SARVAM_KEY },
    body: form,
  });
  if (!res.ok) {
    console.error("Sarvam STT failed", res.status, await res.text());
    return "";
  }
  const data = (await res.json()) as STTResponse;
  return data.transcript ?? "";
}
