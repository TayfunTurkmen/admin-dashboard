import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const getPort = (fallback) => Number(globalThis.process?.env?.PORT) || fallback;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: getPort(5173),
  },
  preview: {
    host: "0.0.0.0",
    port: getPort(4173),
    allowedHosts: ["admin-dashboard-zg4y.onrender.com"],
  },
});
