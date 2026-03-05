/**
 * SVG 占位图生成器 — Amazon 风格配色
 */

/** 根据字符串生成稳定的 hash 数字 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Amazon 风格调色板 */
const PALETTES = [
  { bg1: '#232f3e', bg2: '#131921', text: '#fff' },
  { bg1: '#37475a', bg2: '#232f3e', text: '#fff' },
  { bg1: '#007185', bg2: '#005f73', text: '#fff' },
  { bg1: '#ff9900', bg2: '#e68a00', text: '#fff' },
  { bg1: '#146eb4', bg2: '#0f5a91', text: '#fff' },
  { bg1: '#067d62', bg2: '#056b53', text: '#fff' },
  { bg1: '#c45500', bg2: '#a34700', text: '#fff' },
  { bg1: '#485769', bg2: '#37475a', text: '#fff' },
];

function getPalette(seed: string) {
  return PALETTES[hashCode(seed) % PALETTES.length];
}

/** 编码 SVG 为 data URI */
function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 生成 Banner 占位图 */
export function bannerPlaceholder(
  title: string,
  subtitle: string,
  color1: string,
  color2: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="280" viewBox="0 0 750 280">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}"/>
        <stop offset="100%" style="stop-color:${color2}"/>
      </linearGradient>
    </defs>
    <rect width="750" height="280" fill="url(#bg)"/>
    <circle cx="620" cy="60" r="120" fill="rgba(255,255,255,0.06)"/>
    <circle cx="680" cy="200" r="80" fill="rgba(255,255,255,0.04)"/>
    <text x="60" y="120" font-family="sans-serif" font-size="42" font-weight="bold" fill="#fff">${title}</text>
    <text x="60" y="170" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.85)">${subtitle}</text>
    <rect x="60" y="195" width="140" height="44" rx="22" fill="#ff9900"/>
    <text x="95" y="224" font-family="sans-serif" font-size="20" fill="#fff">Shop now</text>
  </svg>`;
  return svgToDataUri(svg);
}

/** 生成分类图标占位图（圆形） */
export function categoryPlaceholder(name: string): string {
  const p = getPalette(name);
  const char = name.charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.bg1}"/>
        <stop offset="100%" style="stop-color:${p.bg2}"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#bg)"/>
    <text x="50" y="56" font-family="sans-serif" font-size="36" font-weight="600" fill="${p.text}" text-anchor="middle" dominant-baseline="middle">${char}</text>
  </svg>`;
  return svgToDataUri(svg);
}

/** 生成商品占位图（方形卡片） */
export function productPlaceholder(title: string, index?: number): string {
  const seed = index !== undefined ? `product-${index}` : title;
  const p = getPalette(seed);
  const label = title.slice(0, 4);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.bg1}22"/>
        <stop offset="100%" style="stop-color:${p.bg2}22"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="#f8f8f8"/>
    <rect width="400" height="400" fill="url(#bg)"/>
    <circle cx="200" cy="160" r="80" fill="${p.bg1}33"/>
    <circle cx="200" cy="160" r="50" fill="${p.bg1}55"/>
    <rect x="140" y="135" width="120" height="50" rx="8" fill="${p.bg2}77"/>
    <text x="200" y="168" font-family="sans-serif" font-size="24" font-weight="600" fill="#fff" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <text x="200" y="290" font-family="sans-serif" font-size="18" fill="#999" text-anchor="middle">Product</text>
  </svg>`;
  return svgToDataUri(svg);
}
