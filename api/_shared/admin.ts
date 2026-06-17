import { json } from "../sarvam/_shared";

declare const process: { env: Record<string, string | undefined> };

/* __Host- prefix locks the cookie to:
   - the exact host (no Domain attribute allowed)
   - Path=/ (required)
   - Secure (required, set automatically below)
   It's the strongest cookie posture browsers offer. Some local dev
   environments (HTTP localhost) reject Secure cookies, so the dev path
   uses the bare name. */
const PROD_COOKIE = "__Host-kr_admin";
const DEV_COOKIE = "kr_admin";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export const ADMIN_COOKIE_PROD = PROD_COOKIE;
export const ADMIN_COOKIE_DEV = DEV_COOKIE;

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function activeCookieName(): string {
  return isProd() ? PROD_COOKIE : DEV_COOKIE;
}

/* Constant-time string compare — defends against timing attacks on the
   admin password. Pads/clamps to a canonical length so we never branch
   on (a.length !== b.length). */
export function constantTimeEq(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length, 1);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

/* Read either cookie name (prod or dev). Edge runtime gives us a single
   `cookie` header so we parse manually. */
export function readAdminCookie(req: Request): string | null {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.split("=");
    const name = k?.trim();
    if (name === PROD_COOKIE || name === DEV_COOKIE) {
      return decodeURIComponent(rest.join("=").trim());
    }
  }
  return null;
}

/* Verify cookie matches ADMIN_TOKEN. Returns null on success, Response
   on failure. */
export function requireAdmin(req: Request): Response | null {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected) return json({ error: "Admin not configured" }, 503);
  const cookie = readAdminCookie(req) || "";
  if (!constantTimeEq(cookie, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export function setAdminCookieHeader(token: string): string {
  const name = activeCookieName();
  const attrs = [
    `${name}=${encodeURIComponent(token)}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${COOKIE_TTL_SECONDS}`,
  ];
  /* __Host- requires Secure; production is always HTTPS so add it.
     In dev (localhost HTTP), we use the unprefixed name and skip Secure
     so the browser keeps the cookie. */
  if (isProd()) attrs.push("Secure");
  return attrs.join("; ");
}

export function clearAdminCookieHeader(): string {
  const name = activeCookieName();
  const secure = isProd() ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
