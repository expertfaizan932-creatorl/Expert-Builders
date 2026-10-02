import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/Yadea': {
        target: 'http://localhost',
        changeOrigin: true,
      },
      // Local PHP built-in server (php -S localhost:8080) serves ./api.
      // Its configured DB host (sdb-59.hosting.stackcp.net) no longer resolves,
      // so fall back to the live API to keep local dev usable.
      '/api': {
        target: process.env.API_PROXY || 'https://hifimarketing.co',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/agency/api'),
        secure: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
    assetsInlineLimit: 10485760,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
