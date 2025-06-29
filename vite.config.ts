import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
    // Copy _redirects file to dist folder for Render
    copyPublicDir: true,
  },
  server: {
    port: 5173,
    host: true,
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Ensure _redirects file is copied during build
  publicDir: 'public',
});
