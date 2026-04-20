import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT || '3000';
  const apiTarget = `http://127.0.0.1:${apiPort}`;

  return {
    root: 'ui_kits/website',
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      fs: {
        allow: [path.resolve(process.cwd())],
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: '../../dist',
      emptyOutDir: true,
    },
  };
});
