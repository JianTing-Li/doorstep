import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Vite does not execute serverless functions. `vercel dev` serves /api on
    // 3000; without it these requests 404 and the client falls back to parseJob.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
