import React, { lazy, Suspense, useEffect, useState } from "react";
import { DesignNav } from "./DesignNav";
import { DesignFooter } from "./DesignFooter";
import { SocialDock } from "./SocialDock";

/* The chat widget pulls the RAG + voice (sarvam) code. It's a floating
   overlay, never part of first paint, so we lazy-load its chunk and only
   mount it once the browser is idle — keeping it off the critical path on
   every page. */
const ChatWidget = lazy(() =>
  import("../Chat/ChatWidget").then((m) => ({ default: m.ChatWidget }))
);

export const DesignLayout: React.FC<{
  children: React.ReactNode;
  hideFrame?: boolean;
  hideFooter?: boolean;
}> = ({ children, hideFrame, hideFooter }) => {
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const idle = (cb: () => void) => {
      const w = window as typeof window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(cb, { timeout: 3000 });
      } else {
        window.setTimeout(cb, 1500);
      }
    };
    idle(() => setShowChat(true));
  }, []);

  return (
    <>
      <div className="progress" />
      {!hideFrame && <div className="frame" />}
      <DesignNav />
      <SocialDock />
      {children}
      {!hideFooter && <DesignFooter />}
      {showChat && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
    </>
  );
};
