import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: 'ui_kits/website',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: [path.resolve(__dirname)],
    },
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
