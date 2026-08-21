import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
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

export default defineConfig({
  // The deployed site serves this app under /chat/, behind a landing page at the
  // repo root. Asset URLs have to be built against that prefix or the page loads
  // and then fails to fetch its own JS and CSS.
  base: "/chat/",
  plugins: [react(), landingPage()],
  server: {
    // Vite does not execute serverless functions. `vercel dev` serves /api on
    // 3000; without it these requests 404 and the client falls back to parseJob.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
