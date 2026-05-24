/* Client for the Sarvam proxy at /api/sarvam/*.
   The API key NEVER leaves the server - see api/sarvam/tts.ts and stt.ts.
   This module only talks to our own origin, so abuse is gated by the
   serverless functions' rate limit, origin check, and payload caps. */

const TTS_URL = "/api/sarvam/tts";
const STT_URL = "/api/sarvam/stt";

/* Voice features are always "configured" client-side now - the server
   decides whether it can actually proxy (checks SARVAM_API_KEY). The
   client just attempts and degrades gracefully on 503. */
export const sarvamConfigured = () => true;

/* Streams the TTS response and starts playback as bytes arrive - much
   lower perceived latency than waiting for the full mp3.

   Strategy:
   - If MediaSource supports `audio/mpeg`, attach a SourceBuffer and
     append each fetched chunk; playback begins after the first few KB.
   - Fallback: collect all chunks, build a Blob, then play.

   Returns the Audio element so the caller can pause/cancel it. */
export async function sarvamSpeak(
  text: string,
  opts: { speaker?: string } = {}
): Promise<HTMLAudioElement | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: trimmed.slice(0, 500),
      speaker: opts.speaker,
    }),
  });
  if (!res.ok || !res.body) {
    if (res.status !== 503) {
      console.warn("Sarvam TTS proxy failed", res.status);
    }
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

/* Speech-to-text via the proxy. Returns the transcript string or empty
   on any failure. Server enforces a 5MB cap and audio MIME allow-list. */
export async function sarvamTranscribe(audioBlob: Blob): Promise<string> {
  if (audioBlob.size > 5 * 1024 * 1024) {
    console.warn("Sarvam STT: audio over 5MB, skipping");
    return "";
  }
  /* Name the file by its real MIME so Sarvam picks the right decoder.
     MediaRecorder gives audio/webm by default; some browsers give mp4. */
  const ext =
    audioBlob.type.includes("mp4") ? "m4a" :
    audioBlob.type.includes("ogg") ? "ogg" :
    audioBlob.type.includes("wav") ? "wav" : "webm";
  const form = new FormData();
  form.append("file", audioBlob, `audio.${ext}`);

  const res = await fetch(STT_URL, { method: "POST", body: form });
  if (!res.ok) {
    /* Show the upstream detail to make debugging the 502 actually possible. */
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.detail || body?.error || JSON.stringify(body);
    } catch {
      /* not json */
    }
    if (res.status !== 503) {
      console.warn(`Sarvam STT proxy failed (${res.status})`, detail);
    }
    return "";
  }
  const data = (await res.json()) as { transcript?: string };
  return data.transcript || "";
}
