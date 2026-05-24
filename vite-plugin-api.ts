import type { Plugin, Connect } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import path from "node:path";
import { pathToFileURL } from "node:url";

/* Dev-only plugin that mimics Vercel Edge functions for any file under
   /api. Requests to /api/sarvam/tts -> imports api/sarvam/tts.ts and
   calls its default export with a Web Request, then streams the Web
   Response back through Vite's Connect middleware.

   Production: Vercel serves these files natively; this plugin does nothing. */
export function apiHandlers(): Plugin {
  return {
    name: "local-api-handlers",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();

        const urlPath = req.url.split("?")[0].replace(/\/$/, "");
        const relative = urlPath.replace(/^\/api\//, "");
        const candidates = [
          path.resolve(process.cwd(), "api", `${relative}.ts`),
          path.resolve(process.cwd(), "api", relative, "index.ts"),
        ];

        let handlerPath: string | null = null;
        for (const p of candidates) {
          try {
            await import("node:fs/promises").then((fs) => fs.access(p));
            handlerPath = p;
            break;
          } catch {
            /* try next */
          }
        }
        if (!handlerPath) return next();

        try {
          const mod = await server.ssrLoadModule(pathToFileURL(handlerPath).pathname);
          const handler = (mod.default || mod.handler) as
            | ((r: Request) => Promise<Response> | Response)
            | undefined;
          if (!handler) return next();

          // Read body if present.
          const chunks: Buffer[] = [];
          for await (const chunk of req as AsyncIterable<Buffer>) chunks.push(chunk);
          const body = chunks.length ? Buffer.concat(chunks) : undefined;

          const protocol = (req.headers["x-forwarded-proto"] as string) || "http";
          const host = req.headers.host || "localhost";
          const url = `${protocol}://${host}${req.url}`;

          const webHeaders = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (Array.isArray(v)) webHeaders.set(k, v.join(","));
            else if (v) webHeaders.set(k, String(v));
          }

          const init: RequestInit & { duplex?: "half" } = {
            method: req.method,
            headers: webHeaders,
            body:
              req.method && req.method !== "GET" && req.method !== "HEAD" && body
                ? body
                : undefined,
          };
          if (init.body) init.duplex = "half";
          const webReq = new Request(url, init);

          const webRes = await handler(webReq);
          res.statusCode = webRes.status;
          webRes.headers.forEach((value, key) => res.setHeader(key, value));

          if (!webRes.body) {
            res.end();
            return;
          }
          const reader = webRes.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (err) {
          console.error(`[api] ${req.url} crashed:`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Handler crash", detail: String(err) }));
        }
      });
    },
  };
}
