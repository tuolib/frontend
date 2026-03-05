import path from 'node:path';
import { loadEnv } from 'vite';
import type { PluginOption, UserConfig } from 'vite';

interface AppConfigOptions {
  port: number;
  root: string;
  plugins: PluginOption[];
  manualChunks?: (id: string) => string | undefined;
}

function defaultManualChunks(id: string): string | undefined {
  if (id.includes('node_modules')) {
    if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/react-router/')) {
      return 'vendor-react';
    }
    if (id.includes('/ky/') || id.includes('/zustand/')) {
      return 'vendor-utils';
    }
  }
  return undefined;
}

export function createAppConfig({ port, root, plugins, manualChunks }: AppConfigOptions): UserConfig {
  const env = loadEnv('development', path.resolve(root, '../..'), 'VITE_');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins,
    server: {
      port,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: manualChunks ?? defaultManualChunks,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(root, './src'),
      },
    },
  };
}
