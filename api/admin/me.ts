import { json } from "../sarvam/_shared";
import { requireAdmin } from "../_shared/admin";

export const config = { runtime: "edge" };

/* Lightweight "am I logged in?" check used by the /admin page to decide
   whether to render the login form or the dashboard. GET-only — no
   guard() because it doesn't write anything and we want unauthenticated
   callers to get a clean 401 instead of a 405. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const fail = requireAdmin(req);
  if (fail) return fail;
  return json({ ok: true });
}
