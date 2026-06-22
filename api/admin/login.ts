import { clientIp, json, checkOrigin } from "../sarvam/_shared.js";
import { limit } from "../_shared/limits.js";
import { readJson, isString } from "../_shared/validate.js";
import { setAdminCookieHeader, signSession } from "../_shared/admin.js";
import { getSupabase, supabaseConfigured } from "../_shared/supabase.js";

export const config = { runtime: "edge" };

declare const process: { env: Record<string, string | undefined> };

const MAX_BODY_BYTES = 16 * 1024; /* Google access tokens can be large */
const MAX_TOKEN_LEN = 8192;

/* Steady response time defends timing-based probes on the email check. */
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

/* Exchange Google OAuth session (via Supabase) for our admin cookie.

   Flow:
   1. Client signs in with Google through Supabase Auth.
   2. Client sends { accessToken: <supabase JWT> } here.
   3. Server calls supabase.auth.getUser(accessToken) which validates
      the JWT and returns the user record (with email).
   4. We require the email to exactly match ADMIN_EMAIL — anyone else
      who signs in with Google gets a clean 403.
   5. On match, we set the __Host-kr_admin cookie containing
      ADMIN_TOKEN. All subsequent /api/admin/* requests still verify
      that cookie, so the rest of the server stays untouched. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const originDenied = checkOrigin(req);
  if (originDenied) return originDenied;

  /* Single token-bucket protection. We dropped the dedicated brute-force
     counter because the Google flow can't be probed — Google itself
     rate-limits OAuth, and a legitimate logged-in user's tab reloads
     can fire several /api/admin/login calls in quick succession via
     Supabase's onAuthStateChange + StrictMode. Locking them out for
     1 hour for "5 failures" was a bug, not a defense. */
  const ip = clientIp(req);
  if (!limit("adminAuth", ip)) return json({ error: "Rate limit exceeded" }, 429);

  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const hasSecret = !!(
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_TOKEN
  );
  if (!adminEmail || !hasSecret) {
    return json({ error: "Admin not configured" }, 503);
  }
  if (!supabaseConfigured()) {
    return json({ error: "Supabase not configured" }, 503);
  }

  const parsed = await readJson<{ accessToken?: unknown }>(req, MAX_BODY_BYTES);
  if (!parsed.ok) return parsed.res;
  const accessToken = parsed.body.accessToken;
  if (!isString(accessToken, MAX_TOKEN_LEN)) {
    return json({ error: "Missing access token" }, 400);
  }

  return await steady(async () => {
    /* getUser(jwt) calls Supabase's /auth/v1/user with the provided
       token. Service role bypasses RLS but is only used here to make
       the validation call; we never read sensitive user fields beyond
       email + verification status. */
    const supabase = getSupabase()!;
    const { data, error } = await supabase.auth.getUser(accessToken as string);
    if (error || !data?.user) {
      return json({ error: "Invalid Google session" }, 401);
    }

    const email = (data.user.email || "").trim().toLowerCase();
    /* Reject Google accounts that aren't email-verified — a malicious
       OAuth client could otherwise mint tokens for arbitrary unverified
       addresses. */
    const verified =
      Boolean(data.user.email_confirmed_at) ||
      (data.user.user_metadata?.email_verified === true);

    if (!email || !verified || email !== adminEmail) {
      return json({ error: "Not an Admin" }, 403);
    }

    const cookieValue = await signSession(email);
    if (!cookieValue) {
      return json({ error: "Admin not configured" }, 503);
    }
    return json(
      { ok: true, email },
      200,
      {
        "Set-Cookie": setAdminCookieHeader(cookieValue),
        "Cache-Control": "no-store, max-age=0",
      }
    );
  });
}
