import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore
import stabilityFrameworkPlugin from "./vite.stability-plugin.js";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: ["localhost", "dev.geniecellgene.com", "genieaiexpermentationhub.com"],
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
    stabilityFrameworkPlugin({
      enabled: true,
      failOnViolations: false,
      warnOnDuplicates: false,
      checkNaming: true,
      checkComplexity: false,
      maxComplexity: 100,
      maxFileSize: 1000
    }),
    VitePWA({
      registerType: 'autoUpdate',
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
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024, // 25 MB limit for large bundles
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\..*\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:mp4|webm|mp3|wav)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
