import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: true,
    allowedHosts: [".ngrok-free.app"], // allow all ngrok subdomains
    proxy: {
      "/api": process.env.VITE_API_URL || "http://localhost:5001",
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
