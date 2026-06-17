/* Input validation helpers used by every endpoint.

   Why dedicated helpers: the most common security issues at this layer
   are oversize bodies (DoS), wrong content-types (XS-Search, type
   confusion), and tampered identifiers. Centralizing the checks keeps
   each handler tiny and impossible to forget. */

import { json } from "../sarvam/_shared";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* Read and parse a JSON body with a hard byte cap. Rejects:
   - non-application/json (returns 415)
   - oversize bodies, both via Content-Length AND actual streamed bytes
     (returns 413)
   - malformed JSON (returns 400)
   Returns either the parsed body or a Response to return immediately. */
export async function readJson<T = unknown>(
  req: Request,
  maxBytes: number
): Promise<{ ok: true; body: T } | { ok: false; res: Response }> {
  /* Content-Type must be application/json (sendBeacon's Blob also lands
     as application/json because we set the Blob type explicitly). */
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  if (!ct.startsWith("application/json")) {
    return { ok: false, res: json({ error: "Unsupported media type" }, 415) };
  }

  /* Cheap reject: trust the Content-Length when present. */
  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > maxBytes) {
    return { ok: false, res: json({ error: "Payload too large" }, 413) };
  }

  /* Even without a Content-Length, never let a chunked body exceed the
     cap. Stream into chunks, count as we go, abort on overflow. */
  const reader = req.body?.getReader();
  if (!reader) return { ok: false, res: json({ error: "Empty body" }, 400) };
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.length;
    if (received > maxBytes) {
      return { ok: false, res: json({ error: "Payload too large" }, 413) };
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(received);
  let off = 0;
  for (const c of chunks) {
    merged.set(c, off);
    off += c.length;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(merged));
  } catch {
    return { ok: false, res: json({ error: "Invalid JSON" }, 400) };
  }
  if (parsed === null || typeof parsed !== "object") {
    return { ok: false, res: json({ error: "JSON body must be an object" }, 400) };
  }
  return { ok: true, body: parsed as T };
}

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

export function isString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

export function isOneOf<T extends string>(v: unknown, allow: ReadonlySet<T>): v is T {
  return typeof v === "string" && allow.has(v as T);
}

/* Strip ASCII control characters that can break log readers, smuggle
   newlines into structured logs, or hide content from manual review.
   Preserves \t, \n, \r so multi-line messages still render naturally. */
export function sanitizeText(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 9 || c === 10 || c === 13) {
      out += s[i];
      continue;
    }
    if (c < 32 || c === 127) continue; // strip C0 controls + DEL
    out += s[i];
  }
  return out.trim();
}

export function isFiniteInt(v: unknown, min: number, max: number): boolean {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    Number.isInteger(v) &&
    v >= min &&
    v <= max
  );
}

export function isFiniteNumber(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}
