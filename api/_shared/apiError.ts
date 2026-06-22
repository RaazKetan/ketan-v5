import { getSupabase, supabaseConfigured } from "./supabase.js";
import { ipHash, rawIp } from "./identity.js";

/* Fire-and-forget API error logger. Writes a row to api_errors so the
   /admin "API health" card can show 4xx/5xx rates without us having to
   scrape Vercel logs. Failures inside the logger itself are swallowed
   so a logging glitch never breaks the actual request response. */

export async function logApiError(
  req: Request,
  endpoint: string,
  status: number,
  message: string
) {
  try {
    if (!supabaseConfigured()) return;
    const supabase = getSupabase()!;
    const ip = rawIp(req);
    const hash = await ipHash(ip).catch(() => null);
    await supabase.from("api_errors").insert({
      endpoint,
      status,
      message: message.slice(0, 500),
      ip_hash: hash,
    });
  } catch {
    /* swallow */
  }
}
