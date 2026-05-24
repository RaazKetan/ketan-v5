/* Sarvam AI API client — streaming TTS (bulbul:v3 voice "varun") + STT (saarika).
   API key is read from VITE_SARVAM_API_KEY (set it in .env.local). */

const SARVAM_KEY = import.meta.env.VITE_SARVAM_API_KEY as string | undefined;
const TTS_STREAM_URL = "https://api.sarvam.ai/text-to-speech/stream";
const STT_URL = "https://api.sarvam.ai/speech-to-text";

export const sarvamConfigured = () => Boolean(SARVAM_KEY);

/* Streams the TTS response and starts playback as bytes arrive — much
   lower perceived latency than waiting for the full mp3.

   Strategy:
   - If MediaSource supports `audio/mpeg`, attach a SourceBuffer and
     append each fetched chunk; playback begins after the first few KB.
   - Fallback: collect all chunks, build a Blob, then play.

   Returns the Audio element so the caller can pause/cancel it. */
export async function sarvamSpeak(
  text: string,
  opts: { speaker?: string; pace?: number } = {}
): Promise<HTMLAudioElement | null> {
  if (!SARVAM_KEY) {
    console.warn("Sarvam: VITE_SARVAM_API_KEY not set");
    return null;
  }
  if (!text.trim()) return null;

  const res = await fetch(TTS_STREAM_URL, {
    method: "POST",
    headers: {
      "api-subscription-key": SARVAM_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text.slice(0, 500),
      target_language_code: "en-IN",
      speaker: opts.speaker ?? "shubh",
      model: "bulbul:v3",
      pace: opts.pace ?? 0.97,
      speech_sample_rate: 48000,
      output_audio_codec: "mp3",
      enable_preprocessing: true,
    }),
  });
  if (!res.ok || !res.body) {
    console.error("Sarvam TTS failed", res.status, await res.text());
    return null;
  }

  const reader = res.body.getReader();

  if (
    typeof MediaSource !== "undefined" &&
    MediaSource.isTypeSupported("audio/mpeg")
  ) {
    const mediaSource = new MediaSource();
    const url = URL.createObjectURL(mediaSource);
    const audio = new Audio(url);
    audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });

    mediaSource.addEventListener("sourceopen", async () => {
      const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
      const awaitUpdate = () =>
        new Promise<void>((resolve) => {
          if (!sourceBuffer.updating) return resolve();
          sourceBuffer.addEventListener("updateend", () => resolve(), { once: true });
        });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await awaitUpdate();
            if (mediaSource.readyState === "open") mediaSource.endOfStream();
            break;
          }
          await awaitUpdate();
          sourceBuffer.appendBuffer(value);
        }
      } catch (e) {
        console.warn("Sarvam stream error", e);
        try {
          mediaSource.endOfStream("decode");
        } catch {
          /* noop */
        }
      }
    });

    return audio;
  }

  /* Fallback: buffer the whole stream then play. */
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
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
