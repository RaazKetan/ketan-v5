import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePersonalData } from "../../context/PersonalDataContext";
import { buildKnowledgeBase, retrieve, composeAnswer } from "../../services/rag";
import {
  sarvamSpeak,
  sarvamTranscribe,
  sarvamConfigured,
} from "../../services/sarvam";

type Msg = { id: number; role: "user" | "assistant"; text: string };

export const ChatWidget: React.FC = () => {
  const data = usePersonalData();
  const kb = useMemo(() => buildKnowledgeBase(data), [data]);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: "assistant",
      text: "Hi, I'm Ketan's portfolio agent. Ask me anything — work, projects, how to get in touch.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const idRef = useRef(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const send = async (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    setBusy(true);
    setInput("");

    const userMsg: Msg = { id: idRef.current++, role: "user", text: q };
    setMessages((m) => [...m, userMsg]);

    /* Local RAG over Ketan's data — instant, deterministic. */
    const chunks = retrieve(q, kb);
    const answer = composeAnswer(q, chunks);
    const botMsg: Msg = { id: idRef.current++, role: "assistant", text: answer };
    setMessages((m) => [...m, botMsg]);

    /* Speak via Sarvam if configured + toggle on. */
    if (voiceOn && sarvamConfigured()) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const audio = await sarvamSpeak(answer);
        if (audio) {
          audioRef.current = audio;
          audio.play().catch(() => {});
        }
      } catch (e) {
        console.warn("Sarvam TTS error", e);
      }
    }

    setBusy(false);
  };

  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        if (sarvamConfigured()) {
          setBusy(true);
          const transcript = await sarvamTranscribe(blob);
          setBusy(false);
          if (transcript) await send(transcript);
        } else {
          setMessages((m) => [
            ...m,
            {
              id: idRef.current++,
              role: "assistant",
              text: "Voice transcription needs VITE_SARVAM_API_KEY in your .env.local.",
            },
          ]);
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch (e) {
      console.warn("Microphone access failed", e);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  return (
    <>
      <button
        type="button"
        className={`chat-fab${open ? " is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        data-magnet="0.2"
      >
        <span className="chat-fab-dot" />
        <span className="chat-fab-label">{open ? "Close" : "Ask Ketan"}</span>
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Ketan's portfolio">
          <header className="chat-head">
            <div className="chat-head-left">
              <span className="dot" />
              <div>
                <strong>Ketan's agent</strong>
                <span className="chat-sub">RAG + Sarvam voice · en-IN</span>
              </div>
            </div>
            <div className="chat-head-right">
              <button
                type="button"
                className={`chat-toggle${voiceOn ? " is-on" : ""}`}
                onClick={() => setVoiceOn((v) => !v)}
                title={voiceOn ? "Mute voice" : "Enable voice"}
              >
                {voiceOn ? "🔊" : "🔇"}
              </button>
              <button
                type="button"
                className="chat-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </header>

          <div className="chat-scroll" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.role}`}>
                {m.text}
              </div>
            ))}
            {busy && <div className="chat-msg assistant typing">…</div>}
          </div>

          <div className="chat-suggest">
            {[
              "What did you build at Google?",
              "Tell me about Origin",
              "How can I hire you?",
              "What's your stack?",
            ].map((s) => (
              <button
                key={s}
                type="button"
                className="chat-chip"
                onClick={() => send(s)}
                disabled={busy}
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about projects, work, or anything..."
              disabled={busy}
            />
            <button
              type="button"
              className={`chat-mic${recording ? " is-recording" : ""}`}
              onClick={recording ? stopRecording : startRecording}
              aria-label={recording ? "Stop recording" : "Start voice input"}
              disabled={busy && !recording}
            >
              {recording ? "■" : "🎙"}
            </button>
            <button type="submit" className="chat-send" disabled={busy || !input.trim()}>
              ↗
            </button>
          </form>
        </div>
      )}

      <style>{styles}</style>
    </>
  );
};

const styles = `
  .chat-fab {
    position: fixed; right: 28px; bottom: 28px; z-index: 95;
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 22px; border-radius: 999px;
    background: var(--ink); color: var(--bg); border: 0;
    font-family: var(--mono); font-size: 11px; letter-spacing: .14em;
    text-transform: uppercase; cursor: pointer;
    box-shadow: 0 12px 32px rgba(22, 21, 19, 0.18);
    transition: transform .35s var(--ease), box-shadow .35s var(--ease);
  }
  .chat-fab:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(22, 21, 19, 0.22); }
  .chat-fab.is-open { background: var(--accent); }
  .chat-fab-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--bg);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--bg) 30%, transparent);
    animation: pulse 2.4s infinite ease-in-out;
  }

  .chat-panel {
    position: fixed; right: 28px; bottom: 92px; z-index: 95;
    width: min(420px, calc(100vw - 32px));
    max-height: min(640px, calc(100vh - 140px));
    background: var(--bg); border: 1px solid var(--line); border-radius: 12px;
    display: grid; grid-template-rows: auto 1fr auto auto;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(22, 21, 19, 0.18);
    animation: chat-rise .35s var(--ease);
  }
  @keyframes chat-rise {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .chat-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 16px; border-bottom: 1px solid var(--line);
    background: var(--bg-deep);
  }
  .chat-head-left { display: flex; align-items: center; gap: 10px; }
  .chat-head-left .dot {
    width: 8px; height: 8px; border-radius: 50%; background: #2a9b6f;
    box-shadow: 0 0 8px #2a9b6f;
  }
  .chat-head-left strong {
    font-family: var(--serif); font-size: 17px; font-weight: 400;
    display: block;
  }
  .chat-head-left .chat-sub {
    display: block;
    font-family: var(--mono); font-size: 9px; color: var(--muted);
    letter-spacing: .14em; text-transform: uppercase;
  }
  .chat-head-right { display: flex; gap: 8px; align-items: center; }
  .chat-toggle, .chat-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg); border: 1px solid var(--line);
    font-size: 14px; cursor: pointer; line-height: 1;
    display: inline-flex; align-items: center; justify-content: center;
    transition: border-color .3s, background .3s;
  }
  .chat-toggle.is-on { border-color: var(--accent); color: var(--accent); }
  .chat-close { font-size: 20px; }
  .chat-toggle:hover, .chat-close:hover { background: var(--bg-deep); }

  .chat-scroll {
    overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 10px;
    min-height: 200px;
  }
  .chat-scroll::-webkit-scrollbar { width: 4px; }
  .chat-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }

  .chat-msg {
    max-width: 85%; padding: 10px 14px; border-radius: 14px;
    font-size: 14px; line-height: 1.5;
    word-wrap: break-word;
  }
  .chat-msg.user {
    background: var(--ink); color: var(--bg); align-self: flex-end;
    border-bottom-right-radius: 4px;
  }
  .chat-msg.assistant {
    background: var(--bg-deep); color: var(--ink); align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  .chat-msg.typing { letter-spacing: 3px; color: var(--muted); }

  .chat-suggest {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding: 0 16px 12px;
  }
  .chat-chip {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .1em;
    padding: 6px 10px; border-radius: 999px;
    border: 1px solid var(--line); background: var(--bg);
    color: var(--ink-2); cursor: pointer;
    transition: border-color .3s, background .3s, color .3s;
  }
  .chat-chip:hover:not(:disabled) {
    border-color: var(--ink); color: var(--ink); background: var(--bg-deep);
  }
  .chat-chip:disabled { opacity: 0.4; cursor: not-allowed; }

  .chat-input {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px 16px;
    border-top: 1px solid var(--line);
  }
  .chat-input input {
    flex: 1; min-width: 0;
    background: transparent; border: 0;
    border-bottom: 1px solid var(--line);
    padding: 10px 0; font-family: var(--sans); font-size: 14px;
    color: var(--ink); outline: none;
    transition: border-color .3s;
  }
  .chat-input input:focus { border-color: var(--accent); }
  .chat-input input::placeholder { color: var(--muted); }

  .chat-mic, .chat-send {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--ink); color: var(--bg); border: 0;
    cursor: pointer; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 14px;
    transition: transform .25s var(--ease), background .25s;
  }
  .chat-mic:hover:not(:disabled), .chat-send:hover:not(:disabled) {
    transform: scale(1.05);
  }
  .chat-mic.is-recording { background: var(--accent); animation: pulse-rec 1.2s infinite; }
  .chat-mic:disabled, .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
  @keyframes pulse-rec {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 50%, transparent); }
    50%      { box-shadow: 0 0 0 10px transparent; }
  }

  @media (max-width: 600px) {
    .chat-fab { right: 16px; bottom: 16px; padding: 12px 18px; }
    .chat-panel { right: 12px; left: 12px; bottom: 76px; width: auto; max-height: calc(100vh - 100px); }
  }
`;
