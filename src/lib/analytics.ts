import { track as vercelTrack } from "@vercel/analytics";

/* Thin wrapper around Vercel Web Analytics.

   Why a wrapper instead of importing track everywhere:
   1. Centralizes naming so all event names stay snake_cased + searchable.
   2. Silently no-ops if the script hasn't loaded yet (early page-load
      events still fire because @vercel/analytics queues them, but this
      guard prevents any throws from leaking into render code).
   3. Clamps each prop value to <= 255 chars — Vercel's payload limit. */

type Primitive = string | number | boolean | null;
type Props = Record<string, Primitive>;

const MAX_VALUE_LEN = 255;

function sanitize(props?: Props): Props | undefined {
  if (!props) return undefined;
  const out: Props = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string" && v.length > MAX_VALUE_LEN) {
      out[k] = v.slice(0, MAX_VALUE_LEN);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function track(event: string, props?: Props) {
  try {
    vercelTrack(event, sanitize(props));
  } catch {
    /* analytics never throws into render */
  }
}

/* Convenience helpers. Each emits a single canonical event name so the
   dashboard groups them by name and lets you split on props. */

export const trackClick = (target: string, props?: Props) =>
  track("click", { target, ...props });

export const trackNav = (to: string, from?: string) =>
  track("nav", { to, from: from ?? "" });

export const trackSocial = (network: string, href: string) =>
  track("social_click", { network, href });

export const trackChat = (
  action: "open" | "close" | "send" | "voice_input" | "voice_replay" | "voice_toggle",
  props?: Props
) => track("chat", { action, ...props });

export const trackVoice = (
  action:
    | "play_intro"
    | "stop_agent"
    | "start_record"
    | "stop_record"
    | "transcript"
    | "answer"
    | "error",
  props?: Props
) => track("voice", { action, ...props });

export const trackContact = (action: "submit" | "topic_toggle", props?: Props) =>
  track("contact", { action, ...props });

export const trackScrollDepth = (depth: 25 | 50 | 75 | 100, path: string) =>
  track("scroll_depth", { depth, path });

export const trackSection = (name: string, action: "enter" | "exit", ms?: number) =>
  track("section", { name, action, ms: ms ?? 0 });

export const trackDwell = (path: string, ms: number) =>
  track("page_dwell", { path, ms });

export const trackError = (where: string, message: string) =>
  track("error", { where, message });
