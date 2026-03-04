import path from 'node:path';
import { loadEnv } from 'vite';
import type { PluginOption, UserConfig } from 'vite';

interface AppConfigOptions {
  port: number;
  root: string;
  plugins: PluginOption[];
}

export function createAppConfig({ port, root, plugins }: AppConfigOptions): UserConfig {
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
    },
    resolve: {
      alias: {
        '@': path.resolve(root, './src'),
      },
    },
  };
}
