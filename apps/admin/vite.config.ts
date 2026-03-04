import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { createAppConfig } from '../../vite.config.base';

export default defineConfig(createAppConfig({ port: 5174, root: __dirname, plugins: [UnoCSS(), react()] }));
