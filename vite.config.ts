import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore
import stabilityFrameworkPlugin from "./vite.stability-plugin.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: ["localhost", "dev.geniecellgene.com", "genieaiexpermentationhub.com"],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    stabilityFrameworkPlugin({
      enabled: true,
      failOnViolations: false,
      warnOnDuplicates: false,  // Disable size warnings
      checkNaming: true,
      checkComplexity: false,   // Disable complexity warnings (too noisy for large codebase)
      maxComplexity: 100,
      maxFileSize: 1000
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
