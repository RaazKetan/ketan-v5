import type { SupabaseClient } from "@supabase/supabase-js";
import type { readIdentity } from "./identity";

/* Shared visitor + session upsert. Called from every analytics
   endpoint (pageview, event, message) so the parent rows exist before
   the leaf insert. Without this, a fresh visitor's first page view
   would fail the FK constraint because their visitors row only gets
   created when they actually send a message. */

type Identity = Awaited<ReturnType<typeof readIdentity>>;

export async function ensureVisitor(
  supabase: SupabaseClient,
  visitorId: string,
  id: Identity
) {
  return supabase.from("visitors").upsert(
    {
      id: visitorId,
      last_seen_at: new Date().toISOString(),
      ip: id.ip,
      ip_hash: id.ipHash,
      ua: id.ua.ua,
      ua_browser: id.ua.browser,
      ua_os: id.ua.os,
      ua_device: id.ua.device,
      language: id.language,
      country: id.geo.country,
      region: id.geo.region,
      city: id.geo.city,
      timezone: id.geo.timezone,
      latitude: id.geo.latitude,
      longitude: id.geo.longitude,
    },
    { onConflict: "id", ignoreDuplicates: false }
  );
}

export async function ensureSession(
  supabase: SupabaseClient,
  sessionId: string,
  visitorId: string,
  opts: { channel?: string; pagePath?: string | null } = {}
) {
  const row: Record<string, unknown> = {
    id: sessionId,
    visitor_id: visitorId,
  };
  if (opts.channel) row.channel = opts.channel;
  if (opts.pagePath) row.page_path = opts.pagePath;
  return supabase.from("sessions").upsert(row, {
    onConflict: "id",
    ignoreDuplicates: false,
  });
}
