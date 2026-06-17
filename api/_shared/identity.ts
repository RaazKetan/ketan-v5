/* Identity + geo extraction for the conversation log.
   Pulls everything the platform already gives us — Vercel injects
   geo headers automatically — plus a tiny User-Agent parser so we
   don't have to ship `ua-parser-js` to the edge. */

declare const process: { env: Record<string, string | undefined> };

export type Geo = {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
};

export type UA = {
  ua: string;
  browser: string;
  os: string;
  device: "mobile" | "tablet" | "desktop" | "bot" | "unknown";
};

/* Read the leftmost x-forwarded-for token. Multiple proxies append; the
   first is the client. Fall back to x-real-ip, then "unknown". */
export function rawIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/* Vercel injects these on every request to a Vercel deployment.
   Country/region/city are ISO short codes or empty when unknown. */
export function readGeo(req: Request): Geo {
  const h = req.headers;
  const get = (k: string) => {
    const v = h.get(k);
    return v && v.length > 0 ? v : null;
  };
  return {
    country: get("x-vercel-ip-country"),
    region: get("x-vercel-ip-country-region"),
    city: get("x-vercel-ip-city"),
    timezone: get("x-vercel-ip-timezone"),
    latitude: get("x-vercel-ip-latitude"),
    longitude: get("x-vercel-ip-longitude"),
  };
}

export function readLanguage(req: Request): string | null {
  const accept = req.headers.get("accept-language");
  if (!accept) return null;
  /* Top match before any `;q=` weight. */
  return accept.split(",")[0]!.split(";")[0]!.trim() || null;
}

/* Tiny UA parser. Aim is "good enough to bucket users by browser+OS",
   not RFC-perfect device-tree analysis. Order matters — match the most
   specific signatures first. */
export function parseUA(uaString: string | null): UA {
  const ua = uaString || "";
  let browser = "unknown";
  let os = "unknown";
  let device: UA["device"] = "unknown";

  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/curl|wget|httpie|python-requests/i.test(ua)) browser = "CLI";
  else if (/bot|crawler|spider|slurp|googlebot|bingbot/i.test(ua))
    browser = "Bot";

  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  if (/bot|crawler|spider|slurp/i.test(ua)) device = "bot";
  else if (/ipad|tablet/i.test(ua)) device = "tablet";
  else if (/mobi|android|iphone|ipod/i.test(ua)) device = "mobile";
  else if (ua) device = "desktop";

  return { ua, browser, os, device };
}

/* Daily-rotating IP hash. SHA-256(ip + salt + YYYY-MM-DD UTC).
   Stable within a UTC day → useful for "unique IPs today".

   IP_HASH_SALT MUST be set in the environment. We fail closed (return
   null) rather than fall back to a hardcoded salt, because a known salt
   makes the hash trivially reversible by anyone with the codebase. The
   ip_hash column simply stays NULL when the env var is missing — the
   raw ip is still captured separately. */
let warnedNoSalt = false;
export async function ipHash(ip: string): Promise<string | null> {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (!warnedNoSalt) {
      warnedNoSalt = true;
      console.warn(
        "[identity] IP_HASH_SALT not set — ip_hash column will be NULL. " +
          "Set IP_HASH_SALT in Vercel env (openssl rand -base64 32)."
      );
    }
    return null;
  }
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${salt}|${day}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* One-shot: read everything off the request. The endpoint glue layer
   calls this once and passes the bundle to the Supabase upsert. */
export async function readIdentity(req: Request) {
  const ip = rawIp(req);
  return {
    ip,
    ipHash: await ipHash(ip),
    ua: parseUA(req.headers.get("user-agent")),
    language: readLanguage(req),
    geo: readGeo(req),
  };
}
