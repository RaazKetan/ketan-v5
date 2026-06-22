import { json } from "../sarvam/_shared";

declare const process: { env: Record<string, string | undefined> };

/* HMAC-signed admin session cookie.

   Format:  <email>.<expiry_ms>.<base64url(HMAC-SHA256(email + "." + expiry, secret))>

   - Stateless: nothing to store server-side. Cookie itself proves the
     session is real and unexpired. Rotate ADMIN_SESSION_SECRET to
     revoke every active session in one go.
   - The email is part of the cookie so the server knows who signed in
     without re-querying Supabase on every request.
   - The expiry is part of the cookie so we don't need a separate
     Max-Age check; the HMAC binds expiry to the signature, an attacker
     can't extend their own session.
   - Cookie name uses the __Host- prefix in prod (locks to Path=/,
     Secure, no Domain attribute — strongest browser enforcement). Dev
     uses the bare name so localhost HTTP keeps working. */

const PROD_COOKIE = "__Host-kr_admin";
const DEV_COOKIE = "kr_admin";
const COOKIE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function activeCookieName(): string {
  return isProd() ? PROD_COOKIE : DEV_COOKIE;
}

/* Single source of truth for the signing key. Falls back to legacy
   ADMIN_TOKEN if ADMIN_SESSION_SECRET isn't set so existing deploys
   keep working without re-rotating. */
function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_TOKEN ||
    ""
  );
}

function b64url(buf: ArrayBuffer): string {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(msg)
  );
  return b64url(sig);
}

/* Constant-time string compare in JS. Defends against the signature
   check being a timing oracle for valid prefixes. */
function constantTimeEq(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length, 1);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

/* Mint a fresh session cookie value for the given email. */
export async function signSession(
  email: string,
  ttlMs: number = COOKIE_TTL_MS
): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expiry = Date.now() + ttlMs;
  const payload = `${email}.${expiry}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySession(
  cookie: string
): Promise<{ email: string } | null> {
  const secret = getSecret();
  if (!secret) return null;
  const sigDot = cookie.lastIndexOf(".");
  if (sigDot <= 0) return null;
  const sig = cookie.slice(sigDot + 1);
  const head = cookie.slice(0, sigDot);
  const expiryDot = head.lastIndexOf(".");
  if (expiryDot <= 0) return null;
  const expiryStr = head.slice(expiryDot + 1);
  const email = head.slice(0, expiryDot);
  if (!email || !expiryStr || !sig) return null;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return null;
  const expected = await hmac(secret, `${email}.${expiry}`);
  if (!constantTimeEq(sig, expected)) return null;
  return { email };
}

/* Read the kr_admin cookie value, accepting either prod or dev name. */
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

/* Async — used by every /api/admin/* read endpoint. Returns null when
   the cookie verifies, or a 401 Response otherwise. */
export async function requireAdmin(req: Request): Promise<Response | null> {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!adminEmail) return json({ error: "Admin not configured" }, 503);
  const cookie = readAdminCookie(req);
  if (!cookie) return json({ error: "Unauthorized" }, 401);
  const session = await verifySession(cookie);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (session.email.trim().toLowerCase() !== adminEmail) {
    /* Cookie HMAC valid but email doesn't match current allow-list.
       Happens after ADMIN_EMAIL is rotated. */
    return json({ error: "Not an Admin" }, 403);
  }
  return null;
}

export function setAdminCookieHeader(value: string): string {
  const name = activeCookieName();
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${Math.floor(COOKIE_TTL_MS / 1000)}`,
  ];
  /* __Host- requires Secure; production is always HTTPS so add it.
     Dev (localhost HTTP) uses the unprefixed name and skips Secure. */
  if (isProd()) attrs.push("Secure");
  return attrs.join("; ");
}

export function clearAdminCookieHeader(): string {
  const name = activeCookieName();
  const secure = isProd() ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
