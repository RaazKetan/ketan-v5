import { clientIp, json } from "../sarvam/_shared.js";
import { limit } from "../_shared/limits.js";
import { requireAdmin } from "../_shared/admin.js";

export const config = { runtime: "edge" };

/* Lightweight "am I logged in?" probe used by the /admin page. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  /* Shared admin-read budget so this probe can't be hammered to
     enumerate logged-in state across IPs. */
  if (!limit("adminRead", clientIp(req))) {
    return json({ error: "Rate limit exceeded" }, 429);
  }

  const fail = await requireAdmin(req);
  if (fail) return fail;
  return json({ ok: true }, 200, { "Cache-Control": "no-store, max-age=0" });
}
