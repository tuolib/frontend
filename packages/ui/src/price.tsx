/**
 * Price 组件 — 格式化价格显示
 */

import { formatPrice, formatPriceRange } from '@fe/shared';

export interface PriceProps {
  value: string | number | null | undefined;
  original?: string | number | null;
  className?: string;
}

export function Price({ value, original, className = '' }: PriceProps) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="text-red-600 font-semibold">{formatPrice(value)}</span>
      {original && (
        <span className="text-gray-400 text-14 line-through">
          {formatPrice(original)}
        </span>
      )}
    </span>
  );
}

export interface PriceRangeProps {
  min: string | null;
  max: string | null;
  className?: string;
}

export function PriceRange({ min, max, className = '' }: PriceRangeProps) {
  return (
    <span className={`text-red-600 font-semibold ${className}`}>
      {formatPriceRange(min, max)}
    </span>
  );
}
