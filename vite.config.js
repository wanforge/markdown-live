import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'icon.svg',
        'icon.png',
        'sample.md',
        'vendor/atom-one-light.min.css',
        'vendor/katex.min.css',
        'vendor/fonts/**',
      ],
      manifest: false, // We use our own public/manifest.json
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /\/vendor\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vendor-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/sample\.md$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sample-content',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['mermaid', 'cytoscape'],
    include: [
      '@uiw/react-codemirror',
      '@codemirror/lang-markdown',
      '@codemirror/language-data',
    ],
  },
});
