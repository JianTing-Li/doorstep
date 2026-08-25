import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const SHARED_ROOT = fileURLToPath(new URL("../shared/", import.meta.url));

// index.html references /shared/tokens.css, /shared/switcher.css, and
// /shared/switcher.js by absolute path (Phase 2) — that resolves naturally
// once dist/shared/ sits alongside dist/provider/ in production, but this
// app's own dev server only serves from provider/ by default. This mirrors
// the pattern chat/vite.config.js already uses for its landing-page plugin.
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

export default defineConfig({
  // The deployed site serves this app under /provider/, behind the repo-root
  // landing page. Asset URLs have to be built against that prefix or the page
  // loads and then fails to fetch its own JS and CSS.
  base: "/provider/",
  plugins: [react(), sharedAssets()],
  server: {
    port: 5173,
    open: true,
  },
});