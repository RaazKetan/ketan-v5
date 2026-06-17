import {
  getVisitorId,
  getSessionId,
  takeVisitorMeta,
} from "@/lib/visitor";

/* Fire-and-forget message logger. NEVER throws into render — any failure
   is silently swallowed so the chat UI keeps working when the DB is
   unreachable, env vars are missing, the user is offline, etc.

   `keepalive: true` lets the request survive a same-tick navigation
   (e.g. user clicks a link right after sending a message). */

type LogArgs = {
  role: "user" | "agent";
  source: "text" | "voice";
  text: string;
};

export async function logMessage({ role, source, text }: LogArgs) {
  try {
    const body = JSON.stringify({
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      visitorMeta: takeVisitorMeta() ?? undefined,
      role,
      source,
      text,
    });
    await fetch("/api/conversations/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* swallow */
  }
}

/* Mark the current session as ended. Uses sendBeacon when available —
   the navigator queues the request even if the page is being unloaded,
   which a regular `fetch` cannot guarantee. */
export function closeSession() {
  try {
    const payload = JSON.stringify({ sessionId: getSessionId() });
    const url = "/api/conversations/session/close";
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      return;
    }
    /* Fallback for environments without sendBeacon. */
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* swallow */
  }
}
