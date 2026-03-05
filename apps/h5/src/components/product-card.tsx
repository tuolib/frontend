/**
 * ProductCard — Amazon 风格商品卡片，复用于首页/搜索/列表页
 */

import { Link } from 'react-router';
import { Skeleton } from '@fe/ui';
import type { ProductListItem } from '@fe/shared';
import { productPlaceholder } from '@/pages/home/placeholder';

// 星星评分组件
function StarRating({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-4 mt-4">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-10 ${i < Math.round(rating) ? 'text-[#ffa41c]' : 'text-[#ddd]'}`}
          >
            &#9733;
          </span>
        ))}
      </div>
      <span className="text-11 text-[#007185]">{count.toLocaleString()}</span>
    </div>
  );
}

export function ProductCard({ item }: { item: ProductListItem }) {
  const price = item.minPrice ? Number.parseFloat(item.minPrice) : 0;
  const integer = Math.floor(price);
  const decimal = ((price - integer) * 10).toFixed(0);

  // maxPrice 大于 minPrice 时当作划线价
  const comparePrice = item.maxPrice ? Number.parseFloat(item.maxPrice) : 0;
  const hasCompare = comparePrice > price && price > 0;

  const rating = Number.parseFloat(item.avgRating || '0');

  return (
    <Link to={`/product/${item.id}`} className="product-card">
      <div className="product-img">
        <img
          src={item.primaryImage || productPlaceholder(item.title)}
          alt={item.title}
          loading="lazy"
        />
      </div>
      <div className="product-info">
        <div className="product-title">{item.title}</div>
        <StarRating rating={rating} count={item.reviewCount} />
        <div className="product-price">
          <span className="price-symbol">¥</span>
          {integer}
          <span className="text-12">.{decimal}</span>
        </div>
        {hasCompare && (
          <div className="product-compare">¥{comparePrice.toFixed(0)}</div>
        )}
        <div className="product-sales">
          {item.totalSales > 0 ? `${item.totalSales}+ bought` : 'New'}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <Skeleton className="w-full aspect-square" />
      <div className="product-info">
        <Skeleton className="w-full h-14 rounded-4" />
        <Skeleton className="w-3/5 h-14 mt-6 rounded-4" />
        <Skeleton className="w-2/5 h-16 mt-8 rounded-4" />
      </div>
    </div>
  );
}
