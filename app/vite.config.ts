import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { APP } from './src/config.ts'

/** Injects the per-child app title from src/config.ts into index.html. */
function htmlTitle(): Plugin {
  return {
    name: 'html-title-from-config',
    transformIndexHtml(html) {
      return html.replaceAll('__APP_TITLE__', APP.title)
    },
  }
}

export default defineConfig({
  base: APP.base,
  plugins: [
    react(),
    htmlTitle(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: APP.title,
        short_name: APP.shortName,
        description: `${APP.childName}'s painting memory box — photos, voice stories, places and times.`,
        // Explicit index.html: some static hosts (e.g. COS's default object
        // domain, without the china-mainland-ICP-license-gated "static
        // website" mode) don't resolve a bare directory URL to index.html,
        // so the bare `base` path alone would 404 on first launch from the
        // home screen icon.
        start_url: `${APP.base}index.html`,
        theme_color: '#FFF6DF',
        background_color: '#FFFDF6',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
