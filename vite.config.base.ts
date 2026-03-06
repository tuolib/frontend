import path from 'node:path';
import crypto from 'node:crypto';
import { loadEnv } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import type { Plugin, PluginOption, UserConfig } from 'vite';

interface AppConfigOptions {
  port: number;
  root: string;
  plugins: PluginOption[];
  manualChunks?: (id: string) => string | undefined;
  /** 传入 browserslist targets 启用 legacy 插件，false 则禁用 */
  legacyTargets?: string[] | false;
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

function buildTimePlugin(): Plugin {
  return {
    name: 'html-build-time',
    transformIndexHtml(html) {
      const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      return html.replace('<html', `<html data-build-time="${now}"`);
    },
  };
}

function versionPlugin(): Plugin {
  const version = crypto.randomUUID();
  return {
    name: 'app-version',
    config() {
      return {
        define: {
          __APP_VERSION__: JSON.stringify(version),
        },
      };
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version }),
      });
    },
  };
}

export function createAppConfig({ port, root, plugins, manualChunks, legacyTargets }: AppConfigOptions): UserConfig {
  const env = loadEnv('development', path.resolve(root, '../..'), 'VITE_');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  const defaultTargets = ['chrome >= 63', 'safari >= 11', 'firefox >= 67', 'edge >= 79', 'ios >= 11'];
  const targets = legacyTargets === false ? undefined : (legacyTargets ?? defaultTargets);

  const allPlugins: PluginOption[] = [
    ...plugins,
    buildTimePlugin(),
    versionPlugin(),
  ];

  if (targets) {
    allPlugins.push(legacy({ targets }));
  }

  return {
    plugins: allPlugins,
    envDir: path.resolve(root, '../..'),
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
      target: targets ? ['es2015', ...targets] : undefined,
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
