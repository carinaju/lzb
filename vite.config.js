import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev: proxy /api/* to the local dev-api.js proxy (node dev-api.js, port 3001).
    // Production: handled by netlify.toml redirect → netlify/functions/wix-orders.js
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
