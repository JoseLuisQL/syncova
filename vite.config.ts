import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'lucide': ['lucide-react'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0', // Permite conexiones desde cualquier IP
    port: 5173,
    // Removemos el proxy ya que ahora el frontend detecta automáticamente la API
    // El proxy solo funciona en localhost, no desde la red
  },
});
//
sileo
cache
flush
