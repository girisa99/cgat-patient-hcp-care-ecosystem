import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",      // Accept connections from any IP
    port: 5173,           // Standard development port
    open: true,           // Auto-open browser
    strictPort: true,     // Use specified port
    cors: true,           // Enable CORS
    allowedHosts: true,   // Allow all hosts (including ngrok)
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
