import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: [
      "localhost",
      // Legacy domains
      "dev.geniecellgene.com", 
      "genieaiexpermentationhub.com",
      // New 3-tier deployment subdomains
      "geniestudiodev.genieaisuite.com",  // Development
      "geniestudiouat.genieaisuite.com",  // UAT (Netlify)
      "www.genieaisuite.com",             // Production
      "genieaisuite.com",                 // Production (non-www)
      // Lovable preview domains
      ".lovable.app",
      ".lovableproject.com",
      // Vercel preview domains
      ".vercel.app",
    ],
  },
  build: {
    rollupOptions: {
      external: [
        '@capacitor/geolocation',
        '@capacitor/camera',
        '@capacitor/haptics',
        '@capacitor/push-notifications',
        '@capacitor/status-bar',
        '@capacitor/app',
      ],
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // selfDestroying: generates a tiny SW that unregisters itself and clears all caches.
    // This permanently removes the old workbox SW that was intercepting cross-origin
    // Supabase Storage audio/video and causing ERR_CACHE_OPERATION_NOT_SUPPORTED.
    // Manifest still works for PWA installability (Add to Home Screen).
    // TODO: Re-enable full SW with properly scoped caching once media pipeline is stable.
    VitePWA({
      selfDestroying: true,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Genie AI - Mind to Media Production Suite',
        short_name: 'Genie AI',
        description: 'AI-powered video production with one-tap recording, quick clips, and smart remix. The only mobile solution with AI scripts + recording + editing in one app.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['productivity', 'entertainment', 'business'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/mobile-record.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'One-Tap Mobile Recording'
          },
          {
            src: '/screenshots/quick-clips.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'AI Quick Clips Generator'
          }
        ],
        shortcuts: [
          {
            name: 'Quick Record',
            short_name: 'Record',
            description: 'Start recording immediately',
            url: '/genie-studio?tab=vibe&mode=record',
            icons: [{ src: '/icons/record-96.png', sizes: '96x96' }]
          },
          {
            name: 'My Projects',
            short_name: 'Projects',
            description: 'View your media projects',
            url: '/genie-studio?tab=vibe&mode=library',
            icons: [{ src: '/icons/library-96.png', sizes: '96x96' }]
          }
        ]
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
