/**
 * Image 组件 — 懒加载 + fallback
 */

import { useState, type ImgHTMLAttributes } from 'react';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const DEFAULT_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23e5e7eb"><rect width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14">暂无图片</text></svg>';

export function Image({
  src,
  alt = '',
  fallback = DEFAULT_FALLBACK,
  className = '',
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={() => setImgSrc(fallback)}
      {...props}
    />
  );
}
