import React, { useEffect, useMemo, useRef, useState } from "react";
import { sarvamSpeak, sarvamTranscribe } from "../../services/sarvam";
import { buildKnowledgeBase, retrieve, composeAnswer } from "../../services/rag";
import { usePersonalData } from "../../context/PersonalDataContext";
import { PlayIcon, StopIcon, MicIcon } from "./icons";

/* Voice conversation widget.
   1. Agent speaks an intro (manual start; user clicks play once).
   2. While speaking, bars run on the Sarvam audio analyser.
   3. When the intro finishes, the speak button unlocks.
   4. User presses speak -> mic records, bars run on the mic analyser.
   5. User presses stop -> Sarvam STT transcribes, the transcript fades in.
   6. RAG over PersonalDataContext picks an answer -> Sarvam TTS speaks it.
   7. Loops: speak button is ready again for the next turn. */

type Stage =
  | "idle"          // not started, "Press play to hear from me."
  | "agent-speak"   // agent's TTS playing
  | "ready"         // speak button enabled, awaiting user
  | "recording"     // user's mic open
  | "processing"    // STT + RAG running
  | "agent-reply";  // agent's RAG reply TTS playing

type Speaker = "agent" | "user";
type Line = { speaker: Speaker; text: string };

const GREETING =
  "Hi, I'm Ketan. I build AI agents at Emergent, previously at Google. Press speak and ask me anything about the work.";

export const VoiceAnalyzer: React.FC<{ variant?: "compact" | "feature" }> = ({
  variant = "compact",
}) => {
  const data = usePersonalData();
  const kb = useMemo(() => buildKnowledgeBase(data), [data]);

  const isFeature = variant === "feature";
  const BAR_COUNT = isFeature ? 56 : 22;

  const [stage, setStage] = useState<Stage>("idle");
  const [line, setLine] = useState<Line | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0));

  /* Refs for the WebAudio graph + RAF. */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const mediaSourceMapRef = useRef<
    WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>
  >(new WeakMap());

  /* Mic recording refs. */
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recStreamRef = useRef<MediaStream | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const recAnalyserRef = useRef<AnalyserNode | null>(null);

  const ensureCtx = async () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const resetLevels = () => setLevels(Array(BAR_COUNT).fill(0));

  /* Cleanup on unmount. */
  useEffect(() => {
    return () => {
      stopRaf();
      audioRef.current?.pause();
      recorderRef.current?.stop();
      recStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  /* Run an analyser loop until cancelled. */
  const runAnalyserLoop = (analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const step = Math.floor(data.length / BAR_COUNT) || 1;
      const next: number[] = [];
      for (let i = 0; i < BAR_COUNT; i++) next.push(data[i * step] / 255);
      setLevels(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  /* Speak any text via Sarvam, drive bars from its audio. Returns a
     promise that resolves when playback ends (or fails). */
  const speak = async (text: string): Promise<void> => {
    const audio = await sarvamSpeak(text);
    if (!audio) {
      /* Fallback: sine-wave fake bars for 2s so UI isn't dead. */
      let t = 0;
      const tick = () => {
        t += 0.08;
        setLevels(
          Array.from({ length: BAR_COUNT }, (_, i) => {
            const phase = t + i * 0.4;
            return 0.2 + 0.3 * (Math.sin(phase) + 1) * 0.5;
          })
        );
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      await new Promise((r) => setTimeout(r, 2000));
      stopRaf();
      resetLevels();
      return;
    }

    audioRef.current = audio;
    try {
      const ctx = await ensureCtx();
      let source = mediaSourceMapRef.current.get(audio);
      if (!source) {
        source = ctx.createMediaElementSource(audio);
        mediaSourceMapRef.current.set(audio, source);
      }
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      runAnalyserLoop(analyser);
    } catch (err) {
      console.warn("AudioContext wire failed", err);
    }

    await new Promise<void>((resolve) => {
      audio.addEventListener("ended", () => resolve(), { once: true });
      audio.addEventListener("error", () => resolve(), { once: true });
      audio.play().catch(() => resolve());
    });

    stopRaf();
    resetLevels();
    audioRef.current = null;
  };

  const playIntro = async () => {
    if (stage !== "idle") return;
    setStage("agent-speak");
    setLine({ speaker: "agent", text: GREETING });
    await speak(GREETING);
    setStage("ready");
  };

  const stopAgent = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopRaf();
    resetLevels();
    setStage("ready");
  };

  /* Start recording the user. Wires the mic stream through an analyser
     to drive the bars in real time. */
  const startRecording = async () => {
    if (stage !== "ready") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recStreamRef.current = stream;

      const ctx = await ensureCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      recAnalyserRef.current = analyser;
      runAnalyserLoop(analyser);

      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      recChunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) recChunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stopRaf();
        resetLevels();
        stream.getTracks().forEach((t) => t.stop());
        recStreamRef.current = null;
        const blob = new Blob(recChunksRef.current, { type: mime });

        setStage("processing");
        const transcript = await sarvamTranscribe(blob);
        if (!transcript.trim()) {
          setLine({ speaker: "agent", text: "Didn't catch that. Try again?" });
          setStage("ready");
          return;
        }
        /* Fade the user's line in. */
        setLine({ speaker: "user", text: transcript });

        /* Pause briefly so the user sees their transcript before the
           reply starts, then run RAG + speak. */
        await new Promise((r) => setTimeout(r, 700));

        const chunks = retrieve(transcript, kb);
        const answer = composeAnswer(transcript, chunks);
        setLine({ speaker: "agent", text: answer });
        setStage("agent-reply");
        await speak(answer);
        setStage("ready");
      };
      recorderRef.current = rec;
      rec.start();
      setLine({ speaker: "user", text: "Listening…" });
      setStage("recording");
    } catch (e) {
      console.warn("Mic permission failed", e);
      setLine({ speaker: "agent", text: "Mic blocked. Allow microphone and retry." });
      setStage("ready");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
  };

  /* What the button does + what it shows. */
  const buttonConfig = (() => {
    switch (stage) {
      case "idle":
        return { onClick: playIntro, icon: <PlayIcon size={isFeature ? 22 : 12} />, label: "Play intro", busy: false };
      case "agent-speak":
      case "agent-reply":
        return { onClick: stopAgent, icon: <StopIcon size={isFeature ? 22 : 12} />, label: "Stop", busy: false };
      case "ready":
        return { onClick: startRecording, icon: <MicIcon size={isFeature ? 22 : 12} />, label: "Speak", busy: false };
      case "recording":
        return { onClick: stopRecording, icon: <StopIcon size={isFeature ? 22 : 12} />, label: "Send", busy: false };
      case "processing":
        return { onClick: undefined, icon: <PlayIcon size={isFeature ? 22 : 12} />, label: "Thinking…", busy: true };
    }
  })();

  const status = (() => {
    switch (stage) {
      case "idle": return "Press play to start";
      case "agent-speak": return "Agent · speaking";
      case "ready": return "Your turn · press speak";
      case "recording": return "You · recording";
      case "processing": return "Thinking…";
      case "agent-reply": return "Agent · speaking";
    }
  })();

  const transcriptText = line
    ? line.text
    : isFeature
      ? "Press play to hear from me."
      : "Click play to hear from me.";

  return (
    <div className={`va-wrap va-${variant}`}>
      {!isFeature && (
        <h5 className="va-label">
          <span className="va-led" />
          Voice
        </h5>
      )}
      <div className="va-row">
        <button
          type="button"
          className={`va-play${stage === "agent-speak" || stage === "agent-reply" || stage === "recording" ? " is-playing" : ""}`}
          onClick={buttonConfig.onClick}
          disabled={!buttonConfig.onClick}
          aria-label={buttonConfig.label}
          title={buttonConfig.label}
        >
          {buttonConfig.icon}
        </button>
        <div className={`va-bars${stage === "agent-speak" || stage === "agent-reply" || stage === "recording" ? " is-live" : ""}`}>
          {levels.map((v, i) => (
            <span
              key={i}
              className="va-bar"
              style={{ transform: `scaleY(${Math.max(0.08, v)})` }}
            />
          ))}
        </div>
      </div>

      <div className="va-status">
        <span className={`va-status-dot va-status-${stage}`} />
        {status}
      </div>

      <div
        key={(line?.speaker ?? "") + "-" + (line?.text ?? "")}
        className={`va-transcript${line ? " is-on" : ""} ${
          line?.speaker === "user" ? "is-user" : "is-agent"
        }`}
      >
        {line && (
          <span className="va-speaker">{line.speaker === "user" ? "You" : "Agent"}</span>
        )}
        {transcriptText}
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .va-wrap {
    display: flex; flex-direction: column; gap: 14px;
    min-width: 0;
  }
  .va-label {
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: .14em;
    color: var(--muted);
    display: flex; align-items: center; gap: 8px;
  }
  .va-led {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent);
  }
  .va-row {
    display: flex; align-items: center; gap: 14px;
    min-height: 36px;
  }
  .va-play {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--ink); color: var(--bg); border: 0;
    cursor: pointer; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    transition: transform .25s var(--ease), background .25s, opacity .25s;
  }
  .va-play:hover:not(:disabled) { transform: scale(1.05); }
  .va-play.is-playing { background: var(--accent); }
  .va-play:disabled { opacity: 0.5; cursor: not-allowed; }

  .va-bars {
    display: flex; align-items: center; gap: 3px;
    height: 28px; flex: 1; min-width: 0;
  }
  .va-bar {
    flex: 1; min-width: 1px; max-width: 3px;
    height: 100%;
    background: currentColor;
    color: var(--ink-2);
    border-radius: 1px;
    transform-origin: center;
    transition: transform .12s linear, background .3s;
  }
  .va-bars.is-live .va-bar { color: var(--accent); }

  .va-status {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em; color: var(--muted);
  }
  .va-status-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--line);
    transition: background .3s;
  }
  .va-status-idle .va-status-dot,
  .va-status-dot.va-status-idle { background: var(--line); }
  .va-status-ready { background: #2a9b6f; box-shadow: 0 0 6px #2a9b6f; }
  .va-status-agent-speak,
  .va-status-agent-reply { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
  .va-status-recording {
    background: #e0432c; box-shadow: 0 0 6px #e0432c;
    animation: pulse-rec 1s infinite ease-in-out;
  }
  .va-status-processing {
    background: #f0a000; box-shadow: 0 0 6px #f0a000;
    animation: pulse-rec .8s infinite ease-in-out;
  }
  @keyframes pulse-rec {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }

  .va-transcript {
    font-family: var(--serif); font-style: italic;
    font-size: 14px; line-height: 1.5; color: var(--muted);
    min-height: 2.5em;
    opacity: 0; transform: translateY(4px);
    animation: va-fade .6s var(--ease) forwards;
  }
  .va-transcript.is-on {
    opacity: 1; transform: translateY(0); color: var(--ink-2);
  }
  .va-transcript.is-user { color: var(--ink); }
  .va-speaker {
    display: inline-block; margin-right: 10px;
    font-family: var(--mono); font-style: normal; font-size: 10px;
    text-transform: uppercase; letter-spacing: .14em;
    color: var(--accent);
    vertical-align: middle;
  }
  .va-transcript.is-user .va-speaker { color: var(--ink); }
  @keyframes va-fade {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Featured (large) variant */
  .va-wrap.va-feature {
    width: 100%; gap: 32px; align-items: center;
  }
  .va-wrap.va-feature .va-row {
    width: 100%; gap: 28px; min-height: 96px; align-items: center;
  }
  .va-wrap.va-feature .va-play {
    width: 64px; height: 64px;
  }
  .va-wrap.va-feature .va-bars {
    height: 96px; gap: 4px;
  }
  .va-wrap.va-feature .va-bar { max-width: 4px; }
  .va-wrap.va-feature .va-status {
    font-size: 11px;
  }
  .va-wrap.va-feature .va-transcript {
    font-size: clamp(20px, 2.2vw, 30px);
    line-height: 1.45;
    text-align: center;
    max-width: 56ch;
    min-height: 3em;
  }
  .va-wrap.va-feature .va-speaker {
    display: block; margin: 0 0 12px 0;
    font-size: 11px;
  }
`;
