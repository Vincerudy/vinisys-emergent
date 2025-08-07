import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components': '/src/components',
      '@/utils': '/src/utils',
      '@/hooks': '/src/hooks',
    },
  },
  server: {
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
