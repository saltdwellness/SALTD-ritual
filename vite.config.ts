import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir:    'dist',
    sourcemap: false,   // Never expose source maps in production
    minify:    'esbuild',
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'] },
      },
    },
  },
  server: {
    port: 5173,
    headers: {
      // Dev-server security headers (Vercel headers cover production)
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options':        'DENY',
      'Referrer-Policy':        'strict-origin-when-cross-origin',
    },
  },
});
