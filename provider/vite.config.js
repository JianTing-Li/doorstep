import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // The deployed site serves this app under /provider/, behind the repo-root
  // landing page. Asset URLs have to be built against that prefix or the page
  // loads and then fails to fetch its own JS and CSS.
  base: "/provider/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});