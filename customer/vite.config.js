import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
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

export default defineConfig({
  // The deployed site serves this app under /customer/, behind the repo-root
  // landing page.
  base: "/customer/",
  plugins: [react(), sharedAssets()],
  server: {
    // src/index.css does `@import "../../shared/tokens.css"` — that file
    // lives outside this app's root, so the dev server needs permission to
    // read it. Build mode is unaffected.
    fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] },
    port: 5174,
    open: true,
  },
});
