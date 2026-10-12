import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ["focus.ashguard.io"],
    proxy: { "/api": "http://localhost:3310/" },
    hmr: { clientPort: 443 },
  },
});
