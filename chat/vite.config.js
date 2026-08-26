import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const LANDING_PAGE = fileURLToPath(new URL("../index.html", import.meta.url));

// Production serves the repo-root landing page at / and this app at /chat/ from
// one origin. Vite's root is this folder, so without this the landing page is
// missing in dev and its "Open the chatbot" button 404s. Serving the one file
// keeps dev matching production without handing this app the whole repo as its
// web root — the other product folders stay out of reach.
function landingPage() {
  return {
    name: "doorstep-landing-page",
    apply: "serve",
    configureServer(server) {
      // Registered inside configureServer, so it runs before Vite's internal
      // middlewares and takes / before the base redirect sends it to /chat/.
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "/").split("?")[0];
        if (pathname !== "/" && pathname !== "/index.html") return next();
        if (!fs.existsSync(LANDING_PAGE)) return next();

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fs.readFileSync(LANDING_PAGE, "utf8"));
      });
    },
  };
}

// Vite cannot execute serverless functions, so /api/chat would 404 in dev and
// every message would fall back to keyword matching. Rather than require a
// second process (`vercel dev`, which needs a login), run the same handler
// in-process so one `npm run dev` serves the landing page, the app, and the
// Gemini endpoint.
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
      const env = loadEnv(server.config.mode, server.config.root, "");
      if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }
      if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
        process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
      }

      server.middlewares.use("/api/chat", async (req, res, next) => {
        let handler;
        try {
          ({ default: handler } = await import("./api/chat.js"));
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
  // The deployed site serves this app under /chat/, behind a landing page at the
  // repo root. Asset URLs have to be built against that prefix or the page loads
  // and then fails to fetch its own JS and CSS.
  base: "/chat/",
  plugins: [react(), landingPage(), devApi()],
  server: {
    // styles.css now does `@import "../../shared/tokens.css"` (Phase 2) —
    // that file lives outside this app's root, so the dev server needs
    // permission to read it. Build mode is unaffected; this only matters
    // for `npm run dev`.
    fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] },
  },
});
