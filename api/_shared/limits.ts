/* Per-family in-memory rate limiters.

   The shared api/sarvam/_shared.ts limiter mixes every endpoint into a
   single bucket per IP. That means a noisy chat session can exhaust the
   budget for /api/admin/login, and vice versa. Splitting into named
   buckets gives each surface its own headroom AND tighter limits where
   abuse risk is higher.

   Still per-instance (each Edge worker has its own Map). For
   production-grade global limits, swap the Map for Upstash Redis /
   Vercel KV — same signatures. */

type Bucket = { tokens: number; refilled: number };
type DailyEntry = { count: number; windowStart: number };
type WindowedCounter = { count: number; windowStart: number };

type FamilyConfig = {
  capacity: number;      // burst tokens
  refillPerSec: number;  // sustained rate (1 token = 1 request)
  dailyCap: number;      // 24h ceiling
};

const FAMILIES: Record<string, FamilyConfig> = {
  /* Message logging: chat is chatty, but not infinitely. ~30/min
     sustained, 60 burst, 600/day per IP. */
  message:   { capacity: 60, refillPerSec: 0.5,  dailyCap: 600  },
  /* Session close: best-effort beacon, tiny endpoint. Loose. */
  close:     { capacity: 20, refillPerSec: 0.2,  dailyCap: 200  },
  /* Admin read endpoints: only the project owner. Wide for legit use. */
  adminRead: { capacity: 60, refillPerSec: 1.0,  dailyCap: 2000 },
  /* Admin login: dedicated brute-force lockout below — this just keeps
     a high ceiling on accidental retries. */
  adminAuth: { capacity: 10, refillPerSec: 0.1,  dailyCap: 100  },
};

const buckets: Record<string, Map<string, Bucket>> = {};
const daily:   Record<string, Map<string, DailyEntry>> = {};
for (const k of Object.keys(FAMILIES)) {
  buckets[k] = new Map();
  daily[k]   = new Map();
}

const DAY_MS = 24 * 60 * 60 * 1000;

export type Family = keyof typeof FAMILIES;

/* Returns true if the request is allowed, false if it should be rejected.
   Mutates the bucket maps. */
export function limit(family: Family, ip: string): boolean {
  const cfg = FAMILIES[family]!;
  const bMap = buckets[family]!;
  const dMap = daily[family]!;

  const now = Date.now();

  /* Token bucket — bursts. */
  const b = bMap.get(ip) || { tokens: cfg.capacity, refilled: now };
  const elapsed = (now - b.refilled) / 1000;
  b.tokens = Math.min(cfg.capacity, b.tokens + elapsed * cfg.refillPerSec);
  b.refilled = now;
  if (b.tokens < 1) {
    bMap.set(ip, b);
    return false;
  }

  /* Daily cap. */
  const d = dMap.get(ip);
  if (!d || now - d.windowStart > DAY_MS) {
    dMap.set(ip, { count: 1, windowStart: now });
  } else {
    if (d.count >= cfg.dailyCap) return false;
    d.count += 1;
    dMap.set(ip, d);
  }

  b.tokens -= 1;
  bMap.set(ip, b);
  return true;
}

/* ===========================================================================
   Brute-force lockout: dedicated counter for admin login failures.

   Rules: 5 failures per IP per 15 minutes → 1 hour lockout.
   On success we clear the counter so legitimate users aren't locked out
   by an earlier typo. Window-based — simpler than token bucket since we
   want a hard ceiling, not a slow drain. */

const LOGIN_FAIL_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_FAIL_LOCKOUT_MS = 60 * 60 * 1000;
const LOGIN_FAIL_MAX = 5;

type LoginAttempt = WindowedCounter & { lockedUntil: number };
const loginFails = new Map<string, LoginAttempt>();

/* Returns null if the caller may attempt login, or { retryAfter } if
   currently locked out. */
export function checkLoginBruteforce(
  ip: string
): { lockedUntil: number } | null {
  const now = Date.now();
  const a = loginFails.get(ip);
  if (a && a.lockedUntil > now) return { lockedUntil: a.lockedUntil };
  return null;
}

/* Record a failure. Locks the IP out for an hour after the 5th failure. */
export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  const a = loginFails.get(ip) || { count: 0, windowStart: now, lockedUntil: 0 };
  if (now - a.windowStart > LOGIN_FAIL_WINDOW_MS) {
    a.count = 0;
    a.windowStart = now;
  }
  a.count += 1;
  if (a.count >= LOGIN_FAIL_MAX) {
    a.lockedUntil = now + LOGIN_FAIL_LOCKOUT_MS;
  }
  loginFails.set(ip, a);
}

/* Wipe failure counter on success. */
export function clearLoginFailures(ip: string): void {
  loginFails.delete(ip);
}
