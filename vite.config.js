import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev: proxy /api/* to Vercel dev server (vercel dev, port 3000).
    // Production: handled by Vercel → api/wix-orders.js
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
