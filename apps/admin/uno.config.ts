import { defineConfig, presetWind, presetIcons, presetAttributify } from 'unocss';
import rootConfig from '../../uno.config';

export default defineConfig({
  ...rootConfig,
  presets: [
    presetWind({ preflight: false }), // Admin 用 Ant Design，关闭 preflight 避免样式冲突
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
});
