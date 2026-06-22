import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Browser-side Supabase client. Only the publishable (anon) key gets
   shipped — service_role NEVER touches the client bundle. Vite inlines
   any VITE_* env at build time. */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (cached) return cached;
  if (!url || !key) return null;
  cached = createClient(url, key, {
    auth: {
      /* Persist the OAuth session in localStorage so a refresh keeps
         the admin logged in until they sign out or the token expires. */
      persistSession: true,
      autoRefreshToken: true,
      /* Supabase redirects back to /admin after Google flow finishes. */
      detectSessionInUrl: true,
    },
  });
  return cached;
}

export function supabaseClientConfigured(): boolean {
  return !!(url && key);
}
