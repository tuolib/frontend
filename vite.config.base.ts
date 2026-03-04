import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import path from 'node:path';

interface AppConfigOptions {
  port: number;
  root: string;
}

export function createAppConfig({ port, root }: AppConfigOptions): UserConfig {
  return defineConfig({
    plugins: [UnoCSS(), react()],
    server: {
      port,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(root, './src'),
      },
    },
  });
}
