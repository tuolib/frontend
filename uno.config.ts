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
      // implement postcss-pxtorem
      const pxRE = /(-?[.\d]+)rem/g;
      util.entries.forEach(entry => {
        const value = entry[1];
        // @ts-ignore
        if (typeof value === "string" && pxRE.test(value) && isNum(value)) {
          // console.log(entry);
          // console.log(entry[0]);
          // console.log(value);
          // 比如 mt-37.5 设计稿上边距为37.5px, 会转化成0.375rem, 和我们postcss 插件转化比例一致
          // 100 is [rootValue] of postcss-pxtorem in my project
          // eslint-disable-next-line no-param-reassign
          // @ts-ignore
          entry[1] = value.replace(pxRE, (_, pixelValue) => `${pxToRem(pixelValue)}rem`);
        }
      });
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


function pxToRem (num: number) {
  if (isNum(num)) {
    // if (Number(num) < 1) {
    //   return num;
    // }
    // @ts-ignore
    return ((Number(num) * 4) / 100).toFixed(3);
  }
  return num;
}

function isNum(value) {
  // const reg = /^\d+(\.\d{1,2})?$/;
  // const reg = /^-?[0-9]*.?[0-9]*$/;
  const reg = /^[-+]?\d+(?:\.\d+)?/;
  // @ts-ignore
  return reg.test(value);
}
