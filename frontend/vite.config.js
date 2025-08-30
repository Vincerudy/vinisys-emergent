import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/public/images/**',
        '**/*.{png,jpg,jpeg,gif,svg,ico,webp}'
      ],
      usePolling: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        ws: true, // Active WebSocket (utile pour les connexions persistantes)
        logLevel: 'debug', // Permet d'afficher les logs du proxy dans le terminal
        // Supprimé le rewrite car le backend a maintenant le préfixe /api
      },
    },
  },
  
});
