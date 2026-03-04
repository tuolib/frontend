/**
 * UnoCSS 根配置 — 共享 preset，apps 直接引用此文件
 */
import { defineConfig, presetWind, presetIcons, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [
    presetWind(),        // Tailwind CSS 兼容语法
    presetAttributify(), // 支持属性模式 <div text="red" />
    presetIcons({        // 图标 preset，按需加载
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: {
    "flex-cc": "flex justify-center items-center",
    'btn': 'px-4 py-2 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors',
    'btn-primary': 'btn bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    'btn-secondary': 'btn bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    'btn-danger': 'btn bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    'input-base': 'w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
  },
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },
  },
  safelist: [],
  postprocess: [
    util => {
      // UnoCSS 默认 1rem = 0.25rem * n（preset-wind），但 H5 设计稿约定
      // 1rem = 100px，所以需要将 UnoCSS 产出的 rem 值重新换算：
      //   原始 rem 值 × 4（还原为 UnoCSS 内部 unit 数）÷ 100（设计稿 rootValue）
      //   即 n × 4 / 100 = n × 0.04
      const pxRE = /(-?[\d.]+)rem/g;
      for (const entry of util.entries) {
        const value = entry[1];
        if (typeof value !== 'string' || !value.includes('rem')) continue;
        entry[1] = value.replace(pxRE, (_, n) => `${((Number(n) * 4) / 100).toFixed(3)}rem`);
      }
    },
  ],
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|ts|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        "src/**/*.{ts}",
      ],
    },
  },
});
