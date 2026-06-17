import { json } from "../sarvam/_shared";

declare const process: { env: Record<string, string | undefined> };

export const ADMIN_COOKIE = "kr_admin";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

/* Constant-time string compare — defends against timing attacks on the
   admin password. Returns false on length mismatch (which itself can leak
   length, but the password is fixed-length once chosen so this is fine). */
export function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/* Read the kr_admin cookie value, if present. Edge runtime gives a
   single `cookie` header so we parse manually. */
export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.split("=");
    if (k && k.trim() === name) {
      return decodeURIComponent(rest.join("=").trim());
    }
  }
  return null;
}

/* Verify the admin cookie matches ADMIN_TOKEN. Returns null on success
   (caller proceeds), or a Response on failure (caller returns it). */
export function requireAdmin(req: Request): Response | null {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected) return json({ error: "Admin not configured" }, 503);
  const cookie = readCookie(req, ADMIN_COOKIE) || "";
  if (!constantTimeEq(cookie, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export function setAdminCookieHeader(token: string): string {
  /* httpOnly + Secure + SameSite=Lax. Long TTL — admin is just you, so
     no need to re-auth every visit. */
  const attrs = [
    `${ADMIN_COOKIE}=${encodeURIComponent(token)}`,
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Max-Age=${COOKIE_TTL_SECONDS}`,
  ];
  return attrs.join("; ");
}

export function clearAdminCookieHeader(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
