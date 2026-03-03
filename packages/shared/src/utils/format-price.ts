/**
 * 价格格式化 — 后端返回 string 类型的 decimal 值
 */

export function formatPrice(price: string | number | null | undefined): string {
  if (price == null) return '¥0.00';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '¥0.00';
  return `¥${num.toFixed(2)}`;
}

export function formatPriceRange(
  minPrice: string | null,
  maxPrice: string | null,
): string {
  if (!minPrice && !maxPrice) return '¥0.00';
  if (!minPrice) return formatPrice(maxPrice);
  if (!maxPrice || minPrice === maxPrice) return formatPrice(minPrice);
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}
