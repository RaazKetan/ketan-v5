/* Browser-side visitor + session identity.

   - visitor_id: UUID stored in localStorage, stable across all visits
     from the same browser (until storage is cleared / incognito).
   - session_id: UUID stored in sessionStorage, fresh per tab session.
   - visitor metadata: collected once per session and sent with the
     first /api/conversations/message call so the server can stamp the
     visitor row with screen + language + referrer. */

const VISITOR_KEY = "kr_visitor";
const SESSION_KEY = "kr_session";
const META_SENT_KEY = "kr_meta_sent";

function newUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  /* Fallback for very old browsers — RFC 4122 v4. */
  const r = (n: number) =>
    Math.floor(Math.random() * 16 ** n)
      .toString(16)
      .padStart(n, "0");
  return `${r(8)}-${r(4)}-${"4" + r(3)}-${(8 + Math.floor(Math.random() * 4))
    .toString(16)}${r(3)}-${r(12)}`;
}

function safeLocal(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getVisitorId(): string {
  const ls = safeLocal();
  if (!ls) return newUuid();
  let id = ls.getItem(VISITOR_KEY);
  if (!id) {
    id = newUuid();
    ls.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getSessionId(): string {
  const ss = safeSession();
  if (!ss) return newUuid();
  let id = ss.getItem(SESSION_KEY);
  if (!id) {
    id = newUuid();
    ss.setItem(SESSION_KEY, id);
  }
  return id;
}

export type VisitorMeta = {
  language: string;
  screenW: number;
  screenH: number;
  dpr: number;
  referrer: string;
};

/* Returns visitor meta exactly once per session — the first call returns
   the data, every subsequent call returns null. The server uses presence
   of this field to mean "first message of session" and increment
   visit_count on the visitor row. */
export function takeVisitorMeta(): VisitorMeta | null {
  const ss = safeSession();
  if (!ss) return null;
  if (ss.getItem(META_SENT_KEY) === "1") return null;
  ss.setItem(META_SENT_KEY, "1");

  return {
    language: navigator.language || "",
    screenW: window.screen?.width || 0,
    screenH: window.screen?.height || 0,
    dpr: window.devicePixelRatio || 1,
    referrer: document.referrer || "",
  };
}
