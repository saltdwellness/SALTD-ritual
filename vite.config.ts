import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './' ensures assets load correctly on Vercel/Netlify
  // when the app is served from any subdirectory
  base: './',
  build: {
    outDir: 'dist',
    // Generate source maps for production debugging
    sourcemap: false,
    rollupOptions: {
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  // Suppress Vite warnings about large chunks
  server: {
    port: 5173,
  },
});
