import { guard, json } from "../sarvam/_shared";
import { constantTimeEq, setAdminCookieHeader } from "../_shared/admin";

export const config = { runtime: "edge" };

declare const process: { env: Record<string, string | undefined> };

export default async function handler(req: Request): Promise<Response> {
  const blocked = guard(req);
  if (blocked) return blocked;

  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected) return json({ error: "Admin not configured" }, 503);

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const token = String(body.token || "");
  if (!constantTimeEq(token, expected)) {
    /* Same response shape + delay either way so brute force gains no info. */
    return json({ error: "Invalid token" }, 401);
  }

  return json(
    { ok: true },
    200,
    { "Set-Cookie": setAdminCookieHeader(expected) }
  );
}
