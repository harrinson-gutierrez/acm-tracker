import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.API_PROXY_TARGET ?? `http://localhost:${process.env.API_PORT ?? 4000}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    proxy: { "/api": { target: apiTarget, changeOrigin: true } },
  },
});
