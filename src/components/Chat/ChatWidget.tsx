import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePersonalData } from "../../context/PersonalDataContext";
import { buildKnowledgeBase, retrieve, composeAnswer } from "../../services/rag";
import { sarvamSpeak, sarvamTranscribe, SarvamError } from "../../services/sarvam";
import { useChatHistory } from "../../context/ChatHistoryContext";
import {
  ChatIcon,
  CloseIcon,
  SendIcon,
  MicIcon,
  StopIcon,
  SpeakerOn,
  SpeakerOff,
  WaveIcon,
} from "./icons";

const GREETING_TEXT =
  "Hi, I'm Ketan's portfolio agent. Ask me about projects, work, or how to get in touch - chat or voice both work.";

export const ChatWidget: React.FC = () => {
  const data = usePersonalData();
  const kb = useMemo(() => buildKnowledgeBase(data), [data]);
  const { messages: history, addMessage } = useChatHistory();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /* Convert a SarvamError into a friendly one-liner. Voice is a best-effort
     feature — surface a short disclaimer so users know it's degraded but
     can still use the text chat. */
  const explain = (e: unknown, action: "speak" | "transcribe"): string => {
    if (e instanceof SarvamError) {
      if (e.kind === "unavailable") return "Voice is offline right now. You can still chat in text.";
      if (e.kind === "rate-limited") return "Voice limit reached for now. Try again in a minute.";
      if (e.kind === "network") return "Couldn't reach voice service. Check your connection.";
      return action === "speak" ? "Voice playback failed." : "Voice transcription failed.";
    }
    return action === "speak" ? "Voice playback failed." : "Voice transcription failed.";
  };

  /* Auto-clear the notice so it doesn't linger once the user has moved on. */
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  /* Seed the shared history with the greeting the first time anyone
     opens the chat / triggers the voice agent. Re-renders won't add
     duplicates because we check before appending. */
  useEffect(() => {
    if (history.length === 0) addMessage("agent", GREETING_TEXT, "text");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Render-friendly messages: the shared history plus the greeting fallback. */
  const messages = history.length
    ? history
    : [{ id: 0, role: "agent" as const, text: GREETING_TEXT, source: "text" as const, ts: 0 }];

  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  /* Cancel any in-flight playback. */
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSpeakingId(null);
  };

  /* Play a message via Sarvam. Used both for auto-play after a new reply
     and for the per-message replay button. */
  const playMessage = async (msgId: number, text: string) => {
    stopAudio();
    setSpeakingId(msgId);
    try {
      const audio = await sarvamSpeak(text);
      if (!audio) {
        setSpeakingId(null);
        return;
      }
      audioRef.current = audio;
      audio.addEventListener("ended", () => {
        if (audioRef.current === audio) {
          setSpeakingId(null);
          audioRef.current = null;
        }
      });
      audio.addEventListener("error", () => {
        setSpeakingId(null);
        setNotice("Voice playback failed mid-stream. Try again.");
      });
      await audio.play().catch(() => setSpeakingId(null));
    } catch (e) {
      setSpeakingId(null);
      setNotice(explain(e, "speak"));
    }
  };

  const send = async (raw: string, viaVoice = false) => {
    const q = raw.trim();
    if (!q || busy) return;
    setBusy(true);
    setInput("");

    addMessage("user", q, viaVoice ? "voice" : "text");

    /* RAG over Ketan's data - instant, deterministic. */
    const chunks = retrieve(q, kb);
    const answer = composeAnswer(q, chunks);
    const bot = addMessage("agent", answer, "text");

    if (voiceOn) {
      playMessage(bot.id, answer);
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
        setBusy(true);
        try {
          const transcript = await sarvamTranscribe(blob);
          setBusy(false);
          if (transcript) {
            await send(transcript, true);
          } else {
            addMessage(
              "agent",
              "Didn't catch that - try typing instead, or check your mic.",
              "text"
            );
          }
        } catch (e) {
          setBusy(false);
          setNotice(explain(e, "transcribe"));
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch (e) {
      console.warn("Microphone access failed", e);
      setNotice("Microphone blocked. Allow mic access in your browser settings.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const toggleVoice = () => {
    if (voiceOn) stopAudio();
    setVoiceOn((v) => !v);
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
        <span className="chat-fab-icon">
          {open ? <CloseIcon size={14} /> : <ChatIcon size={14} />}
        </span>
        <span className="chat-fab-label">{open ? "Close" : "Ask Ketan"}</span>
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Ketan's portfolio">
          <header className="chat-head">
            <div className="chat-head-left">
              <span className="led" />
              <div>
                <strong>Ketan's agent</strong>
                <span className="chat-sub">RAG · Sarvam voice · en-IN</span>
              </div>
            </div>
            <div className="chat-head-right">
              <button
                type="button"
                className={`chat-icon-btn${voiceOn ? " is-on" : ""}`}
                onClick={toggleVoice}
                title={voiceOn ? "Mute auto-voice" : "Enable auto-voice"}
                aria-pressed={voiceOn}
              >
                {voiceOn ? <SpeakerOn size={14} /> : <SpeakerOff size={14} />}
              </button>
              <button
                type="button"
                className="chat-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <CloseIcon size={14} />
              </button>
            </div>
          </header>

          {notice && (
            <div className="chat-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                className="chat-notice-x"
                onClick={() => setNotice(null)}
                aria-label="Dismiss notice"
              >
                ×
              </button>
            </div>
          )}

          <div className="chat-scroll" ref={scrollRef}>
            {messages.map((m) => {
              const isUser = m.role === "user";
              const rowClass = isUser ? "user" : "assistant";
              return (
                <div key={m.id} className={`chat-row ${rowClass}`}>
                  {isUser && m.source === "voice" && (
                    <span className="voice-tag" title="Sent via voice">
                      <MicIcon size={11} />
                    </span>
                  )}
                  <div className={`chat-msg ${rowClass}`}>{m.text}</div>
                  {!isUser && (
                    <button
                      type="button"
                      className={`chat-replay${speakingId === m.id ? " is-speaking" : ""}`}
                      onClick={() =>
                        speakingId === m.id ? stopAudio() : playMessage(m.id, m.text)
                      }
                      aria-label={
                        speakingId === m.id ? "Stop playback" : "Play message"
                      }
                    >
                      {speakingId === m.id ? <WaveIcon size={12} /> : <span className="play-glyph">▶</span>}
                    </button>
                  )}
                </div>
              );
            })}
            {busy && (
              <div className="chat-row assistant">
                <div className="chat-msg assistant typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
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
              placeholder={recording ? "Listening…" : "Ask about projects, work, anything"}
              disabled={busy && !recording}
            />
            <button
              type="button"
              className={`chat-mic${recording ? " is-recording" : ""}`}
              onClick={recording ? stopRecording : startRecording}
              aria-label={recording ? "Stop recording" : "Start voice input"}
              disabled={busy && !recording}
            >
              {recording ? <StopIcon size={14} /> : <MicIcon size={14} />}
            </button>
            <button
              type="submit"
              className="chat-send"
              disabled={busy || !input.trim()}
              aria-label="Send"
            >
              <SendIcon size={14} />
            </button>
          </form>
        </div>
      )}

      <style>{styles}</style>
    </>
  );
};

const styles = `
  /* FAB */
  .chat-fab {
    position: fixed; right: 28px; bottom: 28px; z-index: 95;
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 22px; border-radius: 999px;
    background: var(--ink); color: var(--bg); border: 0;
    font-family: var(--mono); font-size: 11px; letter-spacing: .14em;
    text-transform: uppercase; cursor: pointer;
    box-shadow: 0 12px 32px rgba(22, 21, 19, 0.18);
    transition: transform .35s var(--ease), box-shadow .35s var(--ease),
                background .35s var(--ease);
  }
  .chat-fab:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(22, 21, 19, 0.22); }
  .chat-fab.is-open { background: var(--accent); }
  .chat-fab-icon { display: inline-flex; }

  /* Panel */
  .chat-panel {
    position: fixed; right: 28px; bottom: 92px; z-index: 95;
    width: min(420px, calc(100vw - 32px));
    max-height: min(640px, calc(100vh - 140px));
    background: var(--bg); border: 1px solid var(--line); border-radius: 12px;
    display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(22, 21, 19, 0.18);
    animation: chat-rise .35s var(--ease);
  }
  @keyframes chat-rise {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .chat-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 16px; border-bottom: 1px solid var(--line);
    background: var(--bg-deep);
  }
  .chat-head-left { display: flex; align-items: center; gap: 10px; }
  .chat-head-left .led {
    width: 8px; height: 8px; border-radius: 50%; background: #2a9b6f;
    box-shadow: 0 0 0 4px color-mix(in oklab, #2a9b6f 18%, transparent);
    animation: pulse 2.4s infinite ease-in-out;
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
  .chat-head-right { display: flex; gap: 6px; align-items: center; }
  .chat-icon-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg); border: 1px solid var(--line);
    cursor: pointer; line-height: 1; color: var(--ink-2);
    display: inline-flex; align-items: center; justify-content: center;
    transition: border-color .3s, background .3s, color .3s;
  }
  .chat-icon-btn:hover { background: var(--bg-deep); color: var(--ink); }
  .chat-icon-btn.is-on { border-color: var(--accent); color: var(--accent); }

  /* Inline disclaimer when voice/agent service is having a moment */
  .chat-notice {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    background: color-mix(in oklab, var(--accent) 8%, var(--bg));
    border-bottom: 1px solid var(--line);
    font-family: var(--mono); font-size: 10.5px;
    letter-spacing: .04em; color: var(--ink-2);
    animation: notice-in .3s var(--ease);
  }
  .chat-notice > span { flex: 1; line-height: 1.4; }
  .chat-notice-x {
    background: transparent; border: 0; cursor: pointer;
    font-size: 18px; line-height: 1; color: var(--muted);
    padding: 0 4px;
  }
  .chat-notice-x:hover { color: var(--ink); }
  @keyframes notice-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Scroll area */
  .chat-scroll {
    flex: 1; min-height: 0;
    overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .chat-scroll::-webkit-scrollbar { width: 4px; }
  .chat-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }

  /* Message rows */
  .chat-row {
    display: flex; align-items: flex-end; gap: 6px;
    max-width: 100%;
  }
  .chat-row.user { justify-content: flex-end; }
  .chat-row.assistant { justify-content: flex-start; }

  .chat-msg {
    max-width: 78%; padding: 10px 14px; border-radius: 14px;
    font-size: 14px; line-height: 1.5;
    word-wrap: break-word;
  }
  .chat-msg.user {
    background: var(--ink); color: var(--bg);
    border-bottom-right-radius: 4px;
  }
  .chat-msg.assistant {
    background: var(--bg-deep); color: var(--ink);
    border-bottom-left-radius: 4px;
  }

  /* Voice tag on user messages */
  .voice-tag {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--ink); color: var(--bg);
    flex-shrink: 0;
  }

  /* Per-assistant-message replay button */
  .chat-replay {
    width: 26px; height: 26px; border-radius: 50%;
    border: 1px solid var(--line); background: var(--bg);
    color: var(--ink-2); cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: border-color .3s, color .3s, background .3s, transform .3s;
  }
  .chat-replay:hover { border-color: var(--ink); color: var(--ink); }
  .chat-replay.is-speaking {
    border-color: var(--accent); color: var(--accent); background: var(--bg);
  }

  /* Wave bars for the speaking indicator */
  .wave-bar { transform-origin: center; }
  .chat-replay.is-speaking .wave-bar-1 { animation: wave 1s ease-in-out infinite; }
  .chat-replay.is-speaking .wave-bar-2 { animation: wave 1s ease-in-out infinite .15s; }
  .chat-replay.is-speaking .wave-bar-3 { animation: wave 1s ease-in-out infinite .3s; }
  @keyframes wave {
    0%, 100% { transform: scaleY(0.5); }
    50%      { transform: scaleY(1); }
  }

  /* Typing indicator (3 dots) */
  .chat-msg.typing {
    display: inline-flex; gap: 4px; padding: 12px 14px;
  }
  .chat-msg.typing span {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--muted); display: inline-block;
    animation: typing 1.2s ease-in-out infinite;
  }
  .chat-msg.typing span:nth-child(2) { animation-delay: .15s; }
  .chat-msg.typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes typing {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50%      { opacity: 1; transform: translateY(-3px); }
  }

  /* Suggested prompts */
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

  /* Input row */
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
    transition: transform .25s var(--ease), background .25s;
  }
  .chat-mic:hover:not(:disabled), .chat-send:hover:not(:disabled) {
    transform: scale(1.05);
  }
  .chat-mic.is-recording {
    background: var(--accent);
    animation: pulse-rec 1.2s infinite;
  }
  .chat-mic:disabled, .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
  @keyframes pulse-rec {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 50%, transparent); }
    50%      { box-shadow: 0 0 0 10px transparent; }
  }

  @media (max-width: 600px) {
    .chat-fab { right: 16px; bottom: 16px; padding: 12px 18px; font-size: 10px; }
    .chat-fab-label { font-size: 10px; }
    .chat-panel {
      right: 12px; left: 12px; bottom: 76px;
      width: auto;
      /* dvh handles the iOS / Android URL bar collapsing so the keyboard
         doesn't push the panel off-screen. */
      max-height: min(640px, calc(100dvh - 96px));
    }
    .chat-msg { font-size: 13px; padding: 9px 12px; }
    .chat-input input { font-size: 16px; /* avoids iOS zoom-on-focus */ }
    .chat-mic, .chat-send { width: 36px; height: 36px; }
  }
`;
