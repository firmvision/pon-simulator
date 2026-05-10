import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pon-simulator/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'PON Network Simulator',
        short_name: 'PON Sim',
        description: 'FTTH passive optical network simulator — design, simulate, and learn GPON/XGS-PON topologies',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        categories: ['education', 'utilities'],
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Runtime caching for dynamic imports
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        // Enable SW in dev so you can test install prompt locally
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: { port: 5174 },
})
