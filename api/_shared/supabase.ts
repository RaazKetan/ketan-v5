import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare const process: { env: Record<string, string | undefined> };

/* Server-only Supabase client. ALWAYS uses the SERVICE_ROLE key — this
   key bypasses Row-Level Security, and it must never reach the browser.
   The /admin and /api/conversations endpoints are the only consumers.

   Cached at module scope: edge functions reuse instances across requests
   on warm invocations (Vercel Fluid Compute), so connection setup happens
   at most once per worker lifetime. */

let cached: SupabaseClient | null = null;

/* The Supabase project URL is not a secret — it's the same string the
   client uses. Accept either SUPABASE_URL (server-only naming) or
   VITE_SUPABASE_URL (client + server) so a single env entry powers both
   surfaces. The SERVICE_ROLE key, by contrast, MUST stay server-only;
   any VITE_-prefixed variant would leak into the bundle. */
function getUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = getUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    /* Don't throw — endpoints return 503 if the DB isn't configured so
       the rest of the site keeps working in environments without Supabase. */
    return null;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
  return cached;
}

export function supabaseConfigured(): boolean {
  return !!(getUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
