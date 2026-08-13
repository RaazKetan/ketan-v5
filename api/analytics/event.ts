import { clientIp, json, checkOrigin } from "../_shared/http.js";
import { limit } from "../_shared/limits.js";
import {
  readJson,
  isUuid,
  isString,
  sanitizeText,
} from "../_shared/validate.js";
import { readIdentity } from "../_shared/identity.js";
import { getSupabase, supabaseConfigured } from "../_shared/supabase.js";
import { logApiError } from "../_shared/apiError.js";
import { ensureVisitor, ensureSession } from "../_shared/upserts.js";

export const config = { runtime: "edge" };

const MAX_BODY_BYTES = 8 * 1024;
const MAX_NAME = 64;
const MAX_PATH = 2048;
const MAX_PROPS_KEYS = 30;
const MAX_PROP_KEY = 64;
const MAX_PROP_VAL = 500;

type Body = {
  visitorId?: unknown;
  sessionId?: unknown;
  name?: unknown;
  props?: unknown;
  path?: unknown;
};

const ENDPOINT = "/api/analytics/event";

/* Sanitize the props bag — only allow primitive values, cap key + value
   sizes, and limit total keys. Defends against unbounded JSONB writes. */
function sanitizeProps(p: unknown): Record<string, string | number | boolean | null> | null {
  if (typeof p !== "object" || p === null) return null;
  const out: Record<string, string | number | boolean | null> = {};
  let count = 0;
  for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
    if (count >= MAX_PROPS_KEYS) break;
    if (typeof k !== "string" || k.length > MAX_PROP_KEY) continue;
    if (v === null) {
      out[k] = null;
    } else if (typeof v === "string") {
      out[k] = sanitizeText(v).slice(0, MAX_PROP_VAL);
    } else if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = v;
    } else if (typeof v === "boolean") {
      out[k] = v;
    } else continue;
    count++;
  }
  return out;
}

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
  if (!isString(b.name, MAX_NAME)) return json({ error: "Bad name" }, 400);

  const id = await readIdentity(req);
  const supabase = getSupabase()!;

  /* Ensure parent rows. Events can fire before any message has been
     sent, so the visitor + session rows might not exist yet. */
  await ensureVisitor(supabase, b.visitorId as string, id);
  await ensureSession(supabase, b.sessionId as string, b.visitorId as string);

  const row = {
    visitor_id: b.visitorId,
    session_id: b.sessionId,
    name: sanitizeText(b.name as string).slice(0, MAX_NAME),
    props: sanitizeProps(b.props),
    path:
      isString(b.path, MAX_PATH) && (b.path as string).startsWith("/")
        ? sanitizeText(b.path as string).slice(0, MAX_PATH)
        : null,
    country: id.geo.country,
  };

  const { error } = await supabase.from("events").insert(row);
  if (error) {
    console.error("[event] insert", error);
    logApiError(req, ENDPOINT, 500, error.message || "insert failed");
    return json({ error: "DB error" }, 500);
  }

  return json({ ok: true }, 200, { "Cache-Control": "no-store, max-age=0" });
}
