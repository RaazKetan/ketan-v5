import React, { useEffect, useRef, useState } from "react";
import { sarvamSpeak } from "../../services/sarvam";
import { PlayIcon, StopIcon } from "./icons";

const GREETING =
  "Hi, I'm Ketan. I build AI agents at Emergent. Tap the chat to ask me anything.";

/* Inline voice greeting widget. Click play -> Sarvam TTS streams the
   greeting, the AudioContext analyser drives the bar heights in real
   time, and the transcript fades in / out. Idle state shows a gentle
   breathing animation so the panel doesn't feel dead.

   variant="compact" = small inline (hero strip column)
   variant="feature" = large featured (replaces a featured section) */
export const VoiceAnalyzer: React.FC<{ variant?: "compact" | "feature" }> = ({
  variant = "compact",
}) => {
  const BAR_COUNT = variant === "feature" ? 56 : 22;
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const sourceMapRef = useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(
    new WeakMap()
  );

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setLevels(Array(BAR_COUNT).fill(0));
    setPlaying(false);
  };

  useEffect(() => {
    return () => {
      stop();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, []);

  const play = async () => {
    if (playing) return stop();
    setLoading(true);
    setTranscript(GREETING);

    const audio = await sarvamSpeak(GREETING);
    setLoading(false);
    if (!audio) {
      /* No audio (key missing / proxy failure) — let the transcript still
         pulse for ~5s so the UI doesn't feel broken. */
      setPlaying(true);
      fakeAnalyserLoop();
      window.setTimeout(() => {
        stop();
        window.setTimeout(() => setTranscript(""), 600);
      }, 5000);
      return;
    }
    audioRef.current = audio;

    /* Wire WebAudio analyser to the Sarvam audio for real frequency bars. */
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      let source = sourceMapRef.current.get(audio);
      if (!source) {
        source = ctx.createMediaElementSource(audio);
        sourceMapRef.current.set(audio, source);
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current || !audioRef.current || audioRef.current.paused) {
          return;
        }
        analyserRef.current.getByteFrequencyData(data);
        const step = Math.floor(data.length / BAR_COUNT) || 1;
        const next: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          const v = data[i * step] / 255;
          next.push(v);
        }
        setLevels(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      console.warn("AudioContext wiring failed; falling back to fake meter", err);
      fakeAnalyserLoop();
    }

    audio.addEventListener(
      "ended",
      () => {
        stop();
        window.setTimeout(() => setTranscript(""), 600);
      },
      { once: true }
    );
    audio.addEventListener("error", stop, { once: true });

    setPlaying(true);
    try {
      await audio.play();
    } catch {
      stop();
    }
  };

  const fakeAnalyserLoop = () => {
    let t = 0;
    const tick = () => {
      t += 0.08;
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        const phase = t + i * 0.4;
        return 0.25 + 0.35 * (Math.sin(phase) + 1) * 0.5;
      });
      setLevels(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const isFeature = variant === "feature";
  const playSize = isFeature ? 22 : 12;

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
          className={`va-play${playing ? " is-playing" : ""}`}
          onClick={play}
          disabled={loading}
          aria-label={playing ? "Stop" : "Play greeting"}
        >
          {playing ? <StopIcon size={playSize} /> : <PlayIcon size={playSize} />}
        </button>
        <div className={`va-bars${playing ? " is-live" : ""}`}>
          {levels.map((v, i) => (
            <span
              key={i}
              className="va-bar"
              style={{ transform: `scaleY(${Math.max(0.08, v)})` }}
            />
          ))}
        </div>
      </div>
      <div className={`va-transcript${transcript ? " is-on" : ""}`}>
        {transcript || (isFeature ? "Press play to hear from me." : "Click play to hear from me.")}
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
    transition: transform .25s var(--ease), background .25s;
  }
  .va-play:hover:not(:disabled) { transform: scale(1.05); }
  .va-play.is-playing { background: var(--accent); }
  .va-play:disabled { opacity: 0.5; cursor: wait; }

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

  .va-transcript {
    font-family: var(--serif); font-style: italic;
    font-size: 14px; line-height: 1.5; color: var(--muted);
    min-height: 2.5em;
    opacity: 0; transform: translateY(4px);
    transition: opacity .6s var(--ease), transform .6s var(--ease), color .6s;
  }
  .va-transcript.is-on {
    opacity: 1; transform: translateY(0); color: var(--ink-2);
  }

  /* Featured (large) variant */
  .va-wrap.va-feature {
    width: 100%; gap: 40px; align-items: center;
  }
  .va-wrap.va-feature .va-row {
    width: 100%;
    gap: 28px;
    min-height: 96px;
    align-items: center;
  }
  .va-wrap.va-feature .va-play {
    width: 64px; height: 64px;
  }
  .va-wrap.va-feature .va-bars {
    height: 96px;
    gap: 4px;
  }
  .va-wrap.va-feature .va-bar {
    max-width: 4px;
  }
  .va-wrap.va-feature .va-transcript {
    font-size: clamp(20px, 2.2vw, 32px);
    line-height: 1.4;
    text-align: center;
    max-width: 56ch;
    min-height: 3em;
  }
`;
