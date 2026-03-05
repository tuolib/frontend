/**
 * SVG 占位图生成器 — 生成好看的 data URI，开发阶段替代真实图片
 */

/** 根据字符串生成稳定的 hash 数字 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** 预设调色板 */
const PALETTES = [
  { bg1: '#ff6b6b', bg2: '#ee5a24', text: '#fff' },
  { bg1: '#a29bfe', bg2: '#6c5ce7', text: '#fff' },
  { bg1: '#55efc4', bg2: '#00b894', text: '#fff' },
  { bg1: '#fdcb6e', bg2: '#e17055', text: '#fff' },
  { bg1: '#74b9ff', bg2: '#0984e3', text: '#fff' },
  { bg1: '#fd79a8', bg2: '#e84393', text: '#fff' },
  { bg1: '#00cec9', bg2: '#0984e3', text: '#fff' },
  { bg1: '#fab1a0', bg2: '#e17055', text: '#fff' },
  { bg1: '#81ecec', bg2: '#00cec9', text: '#fff' },
  { bg1: '#ffeaa7', bg2: '#fdcb6e', text: '#d35400' },
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
    <rect width="750" height="280" fill="url(#bg)" rx="20"/>
    <circle cx="620" cy="60" r="120" fill="rgba(255,255,255,0.08)"/>
    <circle cx="680" cy="200" r="80" fill="rgba(255,255,255,0.06)"/>
    <circle cx="100" cy="240" r="60" fill="rgba(255,255,255,0.05)"/>
    <text x="60" y="120" font-family="sans-serif" font-size="42" font-weight="bold" fill="#fff">${title}</text>
    <text x="60" y="170" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.85)">${subtitle}</text>
    <rect x="60" y="195" width="140" height="44" rx="22" fill="rgba(255,255,255,0.25)"/>
    <text x="97" y="224" font-family="sans-serif" font-size="20" fill="#fff">立即抢购</text>
  </svg>`;
  return svgToDataUri(svg);
}

/** 生成分类图标占位图（圆形） */
export function categoryPlaceholder(name: string): string {
  const p = getPalette(name);
  // 取第一个字
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
  // 取前两个字
  const label = title.slice(0, 4);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.bg1}33"/>
        <stop offset="100%" style="stop-color:${p.bg2}33"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="#f8f8f8"/>
    <rect width="400" height="400" fill="url(#bg)"/>
    <circle cx="200" cy="160" r="80" fill="${p.bg1}44"/>
    <circle cx="200" cy="160" r="50" fill="${p.bg1}66"/>
    <rect x="140" y="135" width="120" height="50" rx="8" fill="${p.bg2}88"/>
    <text x="200" y="168" font-family="sans-serif" font-size="24" font-weight="600" fill="#fff" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <text x="200" y="290" font-family="sans-serif" font-size="18" fill="#999" text-anchor="middle">示例商品</text>
  </svg>`;
  return svgToDataUri(svg);
}

/** 生成秒杀商品占位图 */
export function flashPlaceholder(title: string): string {
  const p = getPalette(title);
  const char = title.slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.bg1}22"/>
        <stop offset="100%" style="stop-color:${p.bg2}22"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="12" fill="#fafafa"/>
    <rect width="200" height="200" rx="12" fill="url(#bg)"/>
    <circle cx="100" cy="85" r="45" fill="${p.bg1}33"/>
    <circle cx="100" cy="85" r="28" fill="${p.bg2}55"/>
    <text x="100" y="93" font-family="sans-serif" font-size="22" font-weight="600" fill="#fff" text-anchor="middle" dominant-baseline="middle">${char}</text>
    <text x="100" y="155" font-family="sans-serif" font-size="14" fill="#999" text-anchor="middle">${title}</text>
  </svg>`;
  return svgToDataUri(svg);
}
