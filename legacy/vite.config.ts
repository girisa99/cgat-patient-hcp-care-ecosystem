import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,                 // fail if 5173 is in use
    allowedHosts: ['dev.geniecellgene.com'],
    origin: 'https://dev.geniecellgene.com',   // ← add comma here
    fs: { allow: ['.'] }              // allow Vite to serve index.html
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});