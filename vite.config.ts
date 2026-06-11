import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

const enableVueDevTools = process.env.VITE_ENABLE_DEVTOOLS === 'true'
const serverHost = process.env.VITE_HOST_ALL === 'true' ? '0.0.0.0' : '127.0.0.1'

export default defineConfig({
  base: '/game-hub-main/',
  plugins: [
    vue(),
    ...(enableVueDevTools ? [vueDevTools()] : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon-192.svg',
        'icons/icon-512.svg',
        'favicon.ico',
        'images/fallback-thumb.png',
        'assets/**/*',
      ],
      manifest: {
        name: 'Game Hub - 遊戲中心',
        short_name: 'Game Hub',
        description: '多合一遊戲平台，包含 12 款遊戲、成就系統、每日任務',
        start_url: '/game-hub-main/#/?source=pwa',
        scope: '/game-hub-main/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0a0a0a',
        theme_color: '#6366f1',
        categories: ['games', 'entertainment'],
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,gif,webp,webm,mp3,wav,ogg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:mp3|wav|ogg|m4a|aac)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:webm|mp4)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'video',
              expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:json)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'data',
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 10,
            },
          },
        ],
        navigateFallback: '/game-hub-main/#/',
        navigateFallbackDenylist: [/^\/admin/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['jeep-sqlite'],
  },
  server: {
    host: serverHost,
    port: 5173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
