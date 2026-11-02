import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff2}'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/admin/],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
