import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { createAppConfig } from '../../vite.config.base';

export default defineConfig(createAppConfig({
  port: 5174,
  root: __dirname,
  plugins: [UnoCSS(), react()],
  codeSplittingGroups: [
    { test: /node_modules\/(react-dom|react|react-router)\//, name: 'vendor-react' },
    { test: /node_modules\/(antd|@ant-design)\//, name: 'vendor-antd' },
    { test: /node_modules\/(ky|zustand)\//, name: 'vendor-utils' },
  ],
}));
