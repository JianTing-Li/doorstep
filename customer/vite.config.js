import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const SHARED_ROOT = fileURLToPath(new URL("../shared/", import.meta.url));

// index.html and src/index.css reference /shared/* by absolute path or
// @import (Phase 2/4 convention). Mirrors provider/vite.config.js's plugin
// of the same name and reasoning: this app's own dev server only serves
// from customer/ by default.
function sharedAssets() {
  return {
    name: "doorstep-shared-assets",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "/").split("?")[0];
        if (!pathname.startsWith("/shared/")) return next();

        const filePath = path.join(SHARED_ROOT, pathname.slice("/shared/".length));
        if (!fs.existsSync(filePath)) return next();

        const type = filePath.endsWith(".css")
          ? "text/css"
          : filePath.endsWith(".js")
            ? "text/javascript"
            : "application/octet-stream";
        res.setHeader("Content-Type", `${type}; charset=utf-8`);
        res.end(fs.readFileSync(filePath));
      });
    },
  };
}

// Vite cannot execute serverless functions, so /api/chat would 404 in dev and
// every Ask message would fall back to keyword matching. Rather than require a
// second process, run the same handler in-process — moved here verbatim from
// chat/vite.config.js in Phase 6, when Product C became the Ask tab.
//
// This is dev-only plumbing. The key is read here in Node and set on
// process.env for the handler; it is never given to the client. Vite only
// inlines VITE_-prefixed variables into the bundle, and GEMINI_API_KEY is
// deliberately not one.
function devApi() {
  return {
    name: "doorstep-dev-api",
    apply: "serve",
    configureServer(server) {
      // Look in this app's folder, the repo root, and chat/ — the key has
      // lived in chat/.env.local since Product C owned the Gemini path, and
      // Phase 6 moving the UI here shouldn't force anyone to move their key.
      const roots = [
        server.config.root,
        fileURLToPath(new URL("..", import.meta.url)),
        fileURLToPath(new URL("../chat", import.meta.url)),
      ];
      for (const dir of roots) {
        if (process.env.GEMINI_API_KEY) break;
        const env = loadEnv(server.config.mode, dir, "");
        if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }

      server.middlewares.use("/api/chat", async (req, res, next) => {
        let handler;
        try {
          ({ default: handler } = await import("../api/chat.js"));
        } catch {
          return next();
        }

        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString("utf8");
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }

        // The handler is written against Vercel's response helpers.
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (payload) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
          return res;
        };

        await handler(req, res);
      });
    },
  };
}

export default defineConfig({
  // The deployed site serves this app under /customer/, behind the repo-root
  // landing page.
  base: "/customer/",
  plugins: [react(), sharedAssets(), devApi()],
  server: {
    // src/index.css does `@import "../../shared/tokens.css"` — that file
    // lives outside this app's root, so the dev server needs permission to
    // read it. Build mode is unaffected.
    fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] },
    port: 5174,
    open: true,
  },
});
