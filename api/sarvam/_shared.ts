/* Shared helpers for Sarvam proxy edge functions.
   Centralizes rate limiting, origin enforcement, and method/method handling
   so each route stays small and the limits are consistent. */

declare const process: { env: Record<string, string | undefined> };

/* Allowed browser origins. Production: your Vercel domain + custom domain.
   Set ALLOWED_ORIGINS in Vercel env as a comma-separated list to override. */
const DEFAULT_ORIGINS = [
  "https://ketan-v5.vercel.app",
  "https://ketanraj.dev",
  "https://www.ketanraj.dev",
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

/* In-memory token-bucket rate limiter. Per-instance — adequate for low-volume
   portfolio traffic combined with Vercel's edge auto-scaling. For high traffic
   swap for Upstash Redis / Vercel KV. Keyed by client IP. */
type Bucket = { tokens: number; refilled: number };
const buckets = new Map<string, Bucket>();
const CAPACITY = 20;          // burst: 20 requests
const REFILL_PER_SEC = 0.5;   // ~30 req/min sustained

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) || { tokens: CAPACITY, refilled: now };
  const elapsed = (now - b.refilled) / 1000;
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_SEC);
  b.refilled = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
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

/* Single guard called at the top of every handler. Returns null if the
   request is allowed, or a Response to return immediately if blocked. */
export function guard(req: Request, method = "POST"): Response | null {
  if (req.method !== method) {
    return json({ error: "Method not allowed" }, 405);
  }
  const allowed = getAllowedOrigins();
  const origin = req.headers.get("origin");
  if (origin && !allowed.has(origin)) {
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

export function getSarvamKey(): string | null {
  return process.env.SARVAM_API_KEY || null;
}
