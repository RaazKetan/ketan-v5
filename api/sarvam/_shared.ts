/* Shared helpers for Sarvam proxy edge functions.
   Centralizes rate limiting, origin enforcement, and method/method handling
   so each route stays small and the limits are consistent. */

declare const process: { env: Record<string, string | undefined> };

/* Allowed browser origins. Production: your Vercel domain + custom domain.
   Set ALLOWED_ORIGINS in Vercel env as a comma-separated list to override. */
const DEFAULT_ORIGINS = [
  "https://ketanraj.com",
  "https://www.ketanraj.com",
  "https://ketan-v5-ketan-rajs-projects.vercel.app",
];
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

export function getAllowedOrigins(): Set<string> {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const list = fromEnv.length ? fromEnv : DEFAULT_ORIGINS;
  if (process.env.NODE_ENV !== "production") list.push(...DEV_ORIGINS);
  return new Set(list);
}

/* Two-tier in-memory rate limit: token-bucket for bursts + daily cap.
   Per-instance only (each Edge instance has its own Map). Combined with
   Vercel's auto-scaling this still bounds an abuser to roughly the limits
   below across the platform. For real production-grade limits, swap for
   Upstash Redis / Vercel KV. Keyed by client IP. */
type Bucket = { tokens: number; refilled: number };
type DailyEntry = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();
const daily = new Map<string, DailyEntry>();

/* Burst guard: 8 requests then refill ~12/min sustained. */
const CAPACITY = 8;
const REFILL_PER_SEC = 0.2;
/* Daily cap: keeps one IP from spending the Sarvam credit overnight. */
const DAILY_CAP = 80;
const DAY_MS = 24 * 60 * 60 * 1000;

export function rateLimit(ip: string): boolean {
  const now = Date.now();

  /* Token bucket — handles bursts. */
  const b = buckets.get(ip) || { tokens: CAPACITY, refilled: now };
  const elapsed = (now - b.refilled) / 1000;
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_SEC);
  b.refilled = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
  }

  /* Daily cap — bounds total spend. */
  const d = daily.get(ip);
  if (!d || now - d.windowStart > DAY_MS) {
    daily.set(ip, { count: 1, windowStart: now });
  } else {
    if (d.count >= DAILY_CAP) return false;
    d.count += 1;
    daily.set(ip, d);
  }

  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/* Vercel preview deploys get URLs like ketan-v5-git-<branch>-<user>.vercel.app.
   Allow them so previews work without per-deploy env config, but only when
   the host clearly belongs to this project + ends in .vercel.app. */
const VERCEL_PREVIEW = /^https:\/\/ketan-v5-[a-z0-9-]+-ketan-rajs-projects\.vercel\.app$/i;

/* Single guard called at the top of every handler. Returns null if the
   request is allowed, or a Response to return immediately if blocked. */
export function guard(req: Request, method = "POST"): Response | null {
  if (req.method !== method) {
    return json({ error: "Method not allowed" }, 405);
  }
  const allowed = getAllowedOrigins();
  const origin = req.headers.get("origin");
  /* Reject same-origin requests with no Origin header in production to
     block cURL-style abuse. Browsers always send Origin on POST. */
  if (process.env.NODE_ENV === "production" && !origin) {
    return json({ error: "Missing origin" }, 403);
  }
  if (origin && !allowed.has(origin) && !VERCEL_PREVIEW.test(origin)) {
    return json({ error: "Forbidden origin" }, 403);
  }
  const ip = clientIp(req);
  if (!rateLimit(ip)) {
    return json({ error: "Rate limit exceeded" }, 429);
  }
  return null;
}

export function json(body: unknown, status = 200, extra: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

let warnedNoKey = false;
let warnedLegacyPrefix = false;
export function getSarvamKey(): string | null {
  /* SARVAM_API_KEY is the canonical name (server-only).
     VITE_SARVAM_API_KEY is supported as a fallback BUT is a leak risk:
     anything with the VITE_ prefix is inlined into client bundles by Vite,
     so the key would be visible to anyone who opens devtools. Warn loudly. */
  const canonical = process.env.SARVAM_API_KEY;
  const legacy = process.env.VITE_SARVAM_API_KEY;

  if (legacy && !canonical && !warnedLegacyPrefix) {
    warnedLegacyPrefix = true;
    console.warn(
      "[sarvam proxy] SECURITY: Found VITE_SARVAM_API_KEY in env. " +
        "The VITE_ prefix exposes secrets to the client bundle. " +
        "Rename it to SARVAM_API_KEY (no prefix) in .env / .env.local."
    );
  }

  const key = canonical || legacy || null;
  if (!key && !warnedNoKey) {
    warnedNoKey = true;
    console.warn(
      "[sarvam proxy] SARVAM_API_KEY not set. " +
        "Add SARVAM_API_KEY=... to .env.local (or Vercel project env)."
    );
  }
  return key;
}
