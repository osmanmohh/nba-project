import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [".ngrok-free.app"], // allow all ngrok subdomains
    proxy: {
      "/api": "http://localhost:5001",
    },
  },
});
