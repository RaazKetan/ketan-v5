import { getVisitorId, getSessionId } from "@/lib/visitor";

/* Fire-and-forget page-view logger. Mirrors conversationLog.ts shape —
   never throws into render, uses keepalive so a navigation mid-send
   doesn't drop the row. */

/* Pull UTM params from any URL. Five canonical names: source, medium,
   campaign, term, content. Anything else is ignored. */
export function readUtm(search: string) {
  const params = new URLSearchParams(search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
  };
}

export async function logPageView(opts: {
  path: string;
  host?: string;
  referrer?: string;
}) {
  try {
    const url = new URL(window.location.href);
    const utm = readUtm(url.search);
    const body = JSON.stringify({
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      path: opts.path,
      host: opts.host || window.location.hostname,
      referrer: opts.referrer ?? document.referrer ?? "",
      ...utm,
    });
    await fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* swallow */
  }
}

export async function logEvent(name: string, props?: Record<string, unknown>) {
  try {
    const body = JSON.stringify({
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      name,
      props: props || null,
      path: window.location.pathname,
    });
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* swallow */
  }
}
