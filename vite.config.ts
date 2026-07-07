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
    include: ['@phosphor-icons/react'],
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor pesado separado del código de la app para mejorar el cacheo
          // y reducir el bundle inicial.
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'excel': ['exceljs'],
          'motion': ['motion'],
          'phosphor': ['@phosphor-icons/react'],
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
