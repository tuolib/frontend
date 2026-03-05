import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { createAppConfig } from '../../vite.config.base';

function manualChunks(id: string): string | undefined {
  if (id.includes('node_modules')) {
    if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/react-router/')) {
      return 'vendor-react';
    }
    if (id.includes('/antd/') || id.includes('/@ant-design/')) {
      return 'vendor-antd';
    }
    if (id.includes('/ky/') || id.includes('/zustand/')) {
      return 'vendor-utils';
    }
  }
  return undefined;
}

export default defineConfig(createAppConfig({ port: 5174, root: __dirname, plugins: [UnoCSS(), react()], manualChunks }));
