import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sivacMockApiPlugin } from './src/mocks/sivacApiPlugin';

// Prevent Vite 5 from exiting immediately when stdin EOF occurs in non-TTY container runners
process.env.CI = 'true';
if (typeof process !== 'undefined' && process.stdin && !process.stdin.isTTY) {
  process.stdin.removeAllListeners('end');
  const origOn = process.stdin.on.bind(process.stdin);
  process.stdin.on = ((event: string, listener: (...args: any[]) => void) => {
    if (event === 'end') return process.stdin;
    return origOn(event, listener);
  }) as typeof process.stdin.on;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sivacMockApiPlugin()],
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
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
