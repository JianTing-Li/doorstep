import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // The deployed site serves this app under /chat/, behind a landing page at the
  // repo root. Asset URLs have to be built against that prefix or the page loads
  // and then fails to fetch its own JS and CSS.
  base: "/chat/",
  plugins: [react()],
  server: {
    // Vite does not execute serverless functions. `vercel dev` serves /api on
    // 3000; without it these requests 404 and the client falls back to parseJob.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
