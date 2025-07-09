/* eslint-env node */
import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  server: {
    host: "::",
    // Use 8080 by default; allow override via $PORT
    port: Number(process.env.PORT || 8080),
    // Allow access from any host (e.g., ngrok) during development
    allowedHosts: ["localhost", "dev.geniecellgene.com"],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
