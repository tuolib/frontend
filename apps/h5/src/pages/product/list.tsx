/**
 * ProductList — 商品列表页 `/product?categoryId=xxx`
 * Amazon 风格：顶部返回+分类名称+搜索，排序栏，2列无限滚动
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { usePaginatedRequest, useRequest } from '@fe/hooks';
import { product, category } from '@fe/api-client';
import { ProductGrid } from '@/components/product-grid';
import { SortBar } from '@/components/sort-bar';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@fe/ui';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'default', label: '综合' },
  { value: 'price_asc', label: '价格↑' },
  { value: 'price_desc', label: '价格↓' },
  { value: 'sales', label: '销量' },
  { value: 'newest', label: '最新' },
];

function parseSortParams(sort: string) {
  switch (sort) {
    case 'price_asc':
      return { sort: 'price', order: 'asc' as const };
    case 'price_desc':
      return { sort: 'price', order: 'desc' as const };
    case 'sales':
      return { sort: 'sales', order: 'desc' as const };
    case 'newest':
      return { sort: 'createdAt', order: 'desc' as const };
    default:
      return { sort: 'createdAt', order: 'desc' as const };
  }
}

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get('categoryId') || undefined;

  const [sort, setSort] = useState('default');
  const sortParams = parseSortParams(sort);

  // Fetch category name for header
  const { data: categoryData } = useRequest(
    (signal) => category.detail(categoryId!, { signal }),
    { immediate: !!categoryId, deps: [categoryId] },
  );

  // Fetch product list with infinite scroll
  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedRequest(
    (page, pageSize, signal) =>
      product.list({
        page,
        pageSize,
        sort: sortParams.sort,
        order: sortParams.order,
        filters: categoryId ? { categoryId } : undefined,
        signal,
      }),
    { pageSize: PAGE_SIZE, deps: [categoryId, sort] },
  );

  const headerTitle = categoryData?.name || 'Products';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId, sort]);

  return (
    <div className="min-h-screen bg-[#eaeded]">
      <PageHeader
        title={headerTitle}
        right={
          <button
            className="w-32 h-32 flex-cc text-20 text-[#0f1111]"
            onClick={() => navigate('/search')}
          >
            <span className="i-carbon-search" />
          </button>
        }
      />

      <SortBar options={SORT_OPTIONS} value={sort} onChange={setSort} />

      <ProductGrid
        key={`${categoryId}-${sort}`}
        items={items}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
      />

      {!loading && items.length === 0 && (
        <EmptyState
          icon={<span className="i-carbon-catalog text-48 text-[#ccc]" />}
          title="No products found"
          description="Try a different category or check back later"
        />
      )}
    </div>
  );
}
