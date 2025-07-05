
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    https: false,
    // Allow ngrok / tunnel hosts
    hmr: {
      clientPort: 8080,
    },
    watch: {
      usePolling: true,
    },
  },
});