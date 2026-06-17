import { json } from "../sarvam/_shared";
import { clearAdminCookieHeader } from "../_shared/admin";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  return json({ ok: true }, 200, {
    "Set-Cookie": clearAdminCookieHeader(),
    "Cache-Control": "no-store, max-age=0",
  });
}
