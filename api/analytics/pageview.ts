import { clientIp, json, checkOrigin } from "../sarvam/_shared";
import { limit } from "../_shared/limits";
import {
  readJson,
  isUuid,
  isString,
  sanitizeText,
} from "../_shared/validate";
import { readIdentity } from "../_shared/identity";
import { getSupabase, supabaseConfigured } from "../_shared/supabase";
import { logApiError } from "../_shared/apiError";
import { ensureVisitor, ensureSession } from "../_shared/upserts";

export const config = { runtime: "edge" };

const MAX_BODY_BYTES = 4 * 1024;
const MAX_PATH = 2048;
const MAX_HOST = 256;
const MAX_REF = 2048;
const MAX_UTM = 256;

type Body = {
  visitorId?: unknown;
  sessionId?: unknown;
  path?: unknown;
  host?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmTerm?: unknown;
  utmContent?: unknown;
};

const ENDPOINT = "/api/analytics/pageview";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const originDenied = checkOrigin(req);
  if (originDenied) return originDenied;

  if (!limit("message", clientIp(req))) {
    return json({ error: "Rate limit exceeded" }, 429);
  }
  if (!supabaseConfigured()) return json({ error: "Logging disabled" }, 503);

  const parsed = await readJson<Body>(req, MAX_BODY_BYTES);
  if (!parsed.ok) return parsed.res;
  const b = parsed.body;

  if (!isUuid(b.visitorId)) return json({ error: "Bad visitorId" }, 400);
  if (!isUuid(b.sessionId)) return json({ error: "Bad sessionId" }, 400);
  if (!isString(b.path, MAX_PATH) || !(b.path as string).startsWith("/"))
    return json({ error: "Bad path" }, 400);

  const id = await readIdentity(req);
  const supabase = getSupabase()!;

  /* Make sure parent rows exist — first pageview from a brand-new
     visitor needs their visitor + session rows in place before the FK
     insert can succeed. Failures are non-fatal for the parent table
     because the leaf insert will surface a clear error anyway. */
  await ensureVisitor(supabase, b.visitorId as string, id);
  await ensureSession(supabase, b.sessionId as string, b.visitorId as string, {
    pagePath: sanitizeText(b.path as string).slice(0, MAX_PATH),
  });

  const row = {
    visitor_id: b.visitorId,
    session_id: b.sessionId,
    path: sanitizeText(b.path as string).slice(0, MAX_PATH),
    host:
      isString(b.host, MAX_HOST) ? sanitizeText(b.host as string) : null,
    referrer:
      isString(b.referrer, MAX_REF) ? sanitizeText(b.referrer as string) : null,
    utm_source:
      isString(b.utmSource, MAX_UTM) ? sanitizeText(b.utmSource as string) : null,
    utm_medium:
      isString(b.utmMedium, MAX_UTM) ? sanitizeText(b.utmMedium as string) : null,
    utm_campaign:
      isString(b.utmCampaign, MAX_UTM) ? sanitizeText(b.utmCampaign as string) : null,
    utm_term:
      isString(b.utmTerm, MAX_UTM) ? sanitizeText(b.utmTerm as string) : null,
    utm_content:
      isString(b.utmContent, MAX_UTM) ? sanitizeText(b.utmContent as string) : null,
    country: id.geo.country,
    region: id.geo.region,
    city: id.geo.city,
    ua_browser: id.ua.browser,
    ua_os: id.ua.os,
    ua_device: id.ua.device,
  };

  const { error } = await supabase.from("page_views").insert(row);
  if (error) {
    console.error("[pageview] insert", error);
    logApiError(req, ENDPOINT, 500, error.message || "insert failed");
    return json({ error: "DB error" }, 500);
  }

  return json({ ok: true }, 200, { "Cache-Control": "no-store, max-age=0" });
}
