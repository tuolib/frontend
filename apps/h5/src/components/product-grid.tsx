/**
 * ProductGrid — 2列商品网格 + 无限滚动，复用于首页/搜索/列表页
 */

import { useRef, useEffect, useCallback } from 'react';
import { Spinner } from '@fe/ui';
import type { ProductListItem } from '@fe/shared';
import { ProductCard, ProductCardSkeleton } from './product-card';

interface ProductGridProps {
  items: ProductListItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export function ProductGrid({ items, loading, loadingMore, hasMore, loadMore }: ProductGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadMoreFn = useCallback(() => { loadMore(); }, [loadMore]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          loadMoreFn();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMoreFn]);

  if (loading) {
    return (
      <div className="amz-product-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <>
      <div className="amz-product-grid">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>

      <div ref={loadMoreRef} className="amz-load-more">
        {hasMore ? (
          loadingMore ? (
            <>
              <Spinner size="sm" className="text-[#565959]" />
              Loading...
            </>
          ) : (
            <span>Scroll for more</span>
          )
        ) : (
          <span>— You've seen it all —</span>
        )}
      </div>
    </>
  );
}
