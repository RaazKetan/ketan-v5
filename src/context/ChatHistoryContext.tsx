import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { logMessage, closeSession } from "@/services/conversationLog";

/* Shared chat history so the VoiceAnalyzer (hero) and ChatWidget (floating)
   show the same conversation. Either surface can append a turn; opening the
   floating chat then shows everything you've said into the mic too.

   Every addMessage call also fires a fire-and-forget POST to
   /api/conversations/message so the conversation lands in Supabase. UI
   state remains in-memory (current behavior) — the database is the
   long-term store. */

export type ChatRole = "user" | "agent";
export type ChatSource = "voice" | "text";

export type ChatMsg = {
  id: number;
  role: ChatRole;
  text: string;
  source: ChatSource;
  ts: number;
};

type Ctx = {
  messages: ChatMsg[];
  addMessage: (role: ChatRole, text: string, source: ChatSource) => ChatMsg;
  clear: () => void;
};

const ChatHistoryContext = createContext<Ctx | null>(null);

export const useChatHistory = (): Ctx => {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) throw new Error("useChatHistory must be inside ChatHistoryProvider");
  return ctx;
};

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const idRef = useRef(1);

  const addMessage = useCallback(
    (role: ChatRole, text: string, source: ChatSource): ChatMsg => {
      const msg: ChatMsg = {
        id: idRef.current++,
        role,
        text,
        source,
        ts: Date.now(),
      };
      setMessages((m) => [...m, msg]);
      /* Side-channel persist. Failures swallowed inside logMessage. */
      logMessage({ role, source, text });
      return msg;
    },
    []
  );

  const clear = useCallback(() => setMessages([]), []);

  /* Close the active session when the tab goes away or hides. Best-
     effort via sendBeacon so even mid-flight navigations land the close. */
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") closeSession();
    };
    const onPagehide = () => closeSession();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPagehide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPagehide);
    };
  }, []);

  return (
    <ChatHistoryContext.Provider value={{ messages, addMessage, clear }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};
