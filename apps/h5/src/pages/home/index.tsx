import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '@fe/hooks';
import { ROUTES } from '@fe/shared';
import { product, category } from '@fe/api-client';
import { Image, PriceRange, Skeleton, Spinner, EmptyState } from '@fe/ui';
import type { ProductListItem, CategoryNode } from '@fe/shared';

const PAGE_SIZE = 10;

function CategoryItem({ item }: { item: CategoryNode }) {
  return (
    <Link
      to={`/product?categoryId=${item.id}`}
      className="flex flex-col items-center shrink-0 w-64"
    >
      <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 mb-6">
        <Image
          src={item.iconUrl ?? undefined}
          alt={item.name}
          className="w-full h-full"
        />
      </div>
      <span className="text-12 text-gray-700 truncate w-full text-center">
        {item.name}
      </span>
    </Link>
  );
}

function ProductCard({ item }: { item: ProductListItem }) {
  return (
    <Link
      to={`/product/${item.id}`}
      className="block bg-white rounded-8 overflow-hidden"
    >
      <div className="w-full aspect-square bg-gray-100">
        <Image
          src={item.primaryImage ?? undefined}
          alt={item.title}
          className="w-full h-full"
        />
      </div>
      <div className="p-8">
        <h3 className="text-14 text-gray-800 line-clamp-2 leading-[1.4]">
          {item.title}
        </h3>
        <div className="mt-6 flex items-center justify-between">
          <PriceRange min={item.minPrice} max={item.maxPrice} className="text-14" />
          <span className="text-10 text-gray-400">
            已售{item.totalSales}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // ── 分类 ──
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(false);

  // ── 商品 ──
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodError, setProdError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    category
      .tree()
      .then((data) => setCategories(data))
      .catch(() => setCatError(true))
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    product
      .list({ page: 1, pageSize: PAGE_SIZE, sort: 'createdAt', order: 'desc' })
      .then(({ items, pagination }) => {
        setProducts(items);
        setHasMore(pagination.page < pagination.totalPages);
      })
      .catch(() => setProdError(true))
      .finally(() => setProdLoading(false));
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const { items, pagination } = await product.list({
        page: nextPage,
        pageSize: PAGE_SIZE,
        sort: 'createdAt',
        order: 'desc',
      });
      setProducts((prev) => [...prev, ...items]);
      setPage(nextPage);
      setHasMore(pagination.page < pagination.totalPages);
    } catch {
      // keep current state
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 登录提示条 */}
      {!isAuthenticated && (
        <div className="flex items-center justify-between bg-blue-50 px-12 py-10 mx-12 mt-12 rounded-8">
          <span className="text-14 text-gray-600">登录后享受更多服务</span>
          <Link to={ROUTES.LOGIN} className="text-14 text-blue-600 font-medium">
            去登录
          </Link>
        </div>
      )}

      {/* 分类横滑区域 */}
      <section className="mt-12 px-12">
        {catLoading ? (
          <div className="flex gap-16 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center shrink-0 w-64">
                <Skeleton className="w-48 h-48 rounded-full" />
                <Skeleton className="w-40 h-12 mt-6 rounded-4" />
              </div>
            ))}
          </div>
        ) : catError ? (
          <EmptyState title="分类加载失败" description="请稍后再试" />
        ) : categories.length > 0 ? (
          <div className="flex gap-16 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <CategoryItem key={cat.id} item={cat} />
            ))}
          </div>
        ) : null}
      </section>

      {/* 商品推荐列表 */}
      <section className="mt-16 px-12">
        <h2 className="text-16 font-bold text-gray-800 mb-12">推荐商品</h2>

        {prodLoading ? (
          <div className="grid grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-8 overflow-hidden">
                <Skeleton className="w-full aspect-square" />
                <div className="p-8">
                  <Skeleton className="w-full h-14 rounded-4" />
                  <Skeleton className="w-3/5 h-14 mt-6 rounded-4" />
                </div>
              </div>
            ))}
          </div>
        ) : prodError ? (
          <EmptyState title="商品加载失败" description="请稍后再试" />
        ) : products.length === 0 ? (
          <EmptyState title="暂无商品" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8">
              {products.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-16 flex justify-center pb-8">
              {hasMore ? (
                <button
                  type="button"
                  className="flex items-center gap-6 px-24 py-8 text-14 text-gray-500 bg-white rounded-full border border-gray-200 active:bg-gray-50"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Spinner size="sm" className="text-gray-400" />
                      加载中...
                    </>
                  ) : (
                    '加载更多'
                  )}
                </button>
              ) : (
                <span className="text-12 text-gray-400">没有更多了</span>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
