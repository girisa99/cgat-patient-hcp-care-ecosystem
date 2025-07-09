import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
<<<<<<< HEAD
    host: "::",
    port: 8080,
    // Hosts allowed to access the dev server
    allowedHosts: ["localhost", "dev.geniecellgene.com"],
=======
  host: "0.0.0.0",
  port: 8080,                               
  allowedHosts: ["localhost", "dev.geniecellgene.com"],
>>>>>>> 0f86293 (chore(dev): dev server & tunnel on port 8080)
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
