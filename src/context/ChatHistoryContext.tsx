import React, { createContext, useCallback, useContext, useRef, useState } from "react";

/* Shared chat history so the VoiceAnalyzer (hero) and ChatWidget (floating)
   show the same conversation. Either surface can append a turn; opening the
   floating chat then shows everything you've said into the mic too. */

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

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      return msg;
    },
    []
  );

  const clear = useCallback(() => setMessages([]), []);

  return (
    <ChatHistoryContext.Provider value={{ messages, addMessage, clear }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};
