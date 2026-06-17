import { clientIp, json, checkOrigin } from "../sarvam/_shared";
import {
  limit,
  checkLoginBruteforce,
  recordLoginFailure,
  clearLoginFailures,
} from "../_shared/limits";
import { readJson, isString } from "../_shared/validate";
import { constantTimeEq, setAdminCookieHeader } from "../_shared/admin";

export const config = { runtime: "edge" };

declare const process: { env: Record<string, string | undefined> };

const MAX_BODY_BYTES = 4 * 1024;
const MAX_TOKEN_LEN = 256;

/* Constant-ish-time response. Always sleeps to the same floor so a
   brute-force attacker can't time-side-channel the cookie compare to
   learn the token's length or prefix. ~120ms is invisible to humans
   but flattens micro-differences in error paths. */
const RESPONSE_FLOOR_MS = 120;
async function steady<T>(fn: () => Promise<T> | T): Promise<T> {
  const t0 = Date.now();
  const value = await fn();
  const elapsed = Date.now() - t0;
  if (elapsed < RESPONSE_FLOOR_MS) {
    await new Promise((r) => setTimeout(r, RESPONSE_FLOOR_MS - elapsed));
  }
  return value;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  /* Origin enforcement: admin login must be initiated from our own UI. */
  const originDenied = checkOrigin(req);
  if (originDenied) return originDenied;

  /* Two layers of throttle:
     1. shared 'adminAuth' bucket — slow accidental retry storms
     2. dedicated brute-force lockout — 5 failures in 15 min → 1 hour ban */
  const ip = clientIp(req);
  if (!limit("adminAuth", ip)) return json({ error: "Rate limit exceeded" }, 429);

  const locked = checkLoginBruteforce(ip);
  if (locked) {
    const retryAfter = Math.max(
      1,
      Math.ceil((locked.lockedUntil - Date.now()) / 1000)
    );
    return json(
      { error: "Too many failed attempts" },
      429,
      { "Retry-After": String(retryAfter) }
    );
  }

  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected) return json({ error: "Admin not configured" }, 503);

  const parsed = await readJson<{ token?: unknown }>(req, MAX_BODY_BYTES);
  if (!parsed.ok) return parsed.res;
  const token = parsed.body.token;
  if (!isString(token, MAX_TOKEN_LEN)) {
    /* Treat malformed token as a failure but DON'T record bruteforce —
       this is the "user pressed enter on empty field" path. */
    return json({ error: "Invalid token" }, 400);
  }

  return await steady(() => {
    if (!constantTimeEq(token as string, expected)) {
      recordLoginFailure(ip);
      return json({ error: "Invalid token" }, 401);
    }
    clearLoginFailures(ip);
    return json(
      { ok: true },
      200,
      {
        "Set-Cookie": setAdminCookieHeader(expected),
        "Cache-Control": "no-store, max-age=0",
      }
    );
  });
}
