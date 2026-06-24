import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pokeball.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Pokédex Competitiva',
        short_name: 'Pokédex',
        description:
          'Pokédex competitiva com stats, builds por formato, comparação e criador de times.',
        theme_color: '#e53e3e',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell; runtime-cache external images and API data.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-sprites',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/pokeapi\.co\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pokeapi',
              expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/data\.pkmn\.cc\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'smogon-data',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
});
