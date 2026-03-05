import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRequest, usePaginatedRequest } from '@fe/hooks';
import { product, category, banner as bannerApi } from '@fe/api-client';
import { Skeleton } from '@fe/ui';
import type { ProductListItem, BannerItem } from '@fe/shared';
import { ProductGrid } from '@/components/product-grid';
import {
  bannerPlaceholder,
  productPlaceholder,
} from './placeholder';
import './home.scss';

const PAGE_SIZE = 10;

// ── 占位 Banner（API 无数据时 fallback） ──

const FALLBACK_BANNERS = [
  { id: 'fb1', title: 'New Arrivals', subtitle: 'Shop the latest products', imageUrl: bannerPlaceholder('New Arrivals', 'Shop the latest products', '#232f3e', '#37475a'), linkType: 'category', linkValue: null },
  { id: 'fb2', title: 'Deal of the Day', subtitle: 'Up to 40% off', imageUrl: bannerPlaceholder('Deal of the Day', 'Up to 40% off', '#007185', '#005f73'), linkType: 'category', linkValue: null },
  { id: 'fb3', title: 'Top Sellers', subtitle: 'Most popular items', imageUrl: bannerPlaceholder('Top Sellers', 'Most popular items', '#131921', '#232f3e'), linkType: 'category', linkValue: null },
];

// ── Banner 轮播 ──

function BannerCarousel({ banners }: { banners: Array<Pick<BannerItem, 'id' | 'imageUrl' | 'title' | 'linkType' | 'linkValue'>> }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  const handleClick = (b: Pick<BannerItem, 'linkType' | 'linkValue'>) => {
    if (!b.linkValue) return;
    if (b.linkType === 'product') {
      navigate(`/dp/${b.linkValue}`);
    } else if (b.linkType === 'category') {
      navigate(`/product?categoryId=${b.linkValue}`);
    }
  };

  return (
    <div className="amz-banner">
      <div className="banner-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((b) => (
          <div key={b.id} className="banner-slide" onClick={() => handleClick(b)}>
            <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((b, i) => (
            <div key={b.id} className={`dot ${i === current ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 分类胶囊横滑 ──

function CategoryPills({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <div className="amz-pills">
      <div className="pills-scroll">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/product?categoryId=${cat.id}`} className="pill">
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function PillsSkeleton() {
  return (
    <div className="amz-pills">
      <div className="pills-scroll">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-60 h-30 rounded-15 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

// ── Deal of the Day（销量 Top） ──

function DealSection({ items }: { items: ProductListItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="amz-deals">
      <div className="deals-header">
        <span className="deals-title">Deal of the Day</span>
        <Link to="/product" className="deals-more">
          See all deals <span className="i-carbon-chevron-right text-12" />
        </Link>
      </div>
      <div className="deals-scroll">
        {items.map((item) => {
          const price = item.minPrice ? Number.parseFloat(item.minPrice) : 0;
          const comparePrice = item.maxPrice ? Number.parseFloat(item.maxPrice) : 0;
          const discount = comparePrice > price && price > 0
            ? Math.round((1 - price / comparePrice) * 100)
            : 0;

          return (
            <Link key={item.id} to={`/dp/${item.id}`} className="deal-item">
              <div className="deal-img">
                <img
                  src={item.primaryImage || productPlaceholder(item.title)}
                  alt={item.title}
                  loading="lazy"
                />
              </div>
              {discount > 0 && (
                <span className="deal-discount">{discount}% off</span>
              )}
              <div className="deal-price">
                <span className="text-11">¥</span>
                {price.toFixed(0)}
              </div>
              <div className="deal-label">
                {item.totalSales > 0 ? `${item.totalSales}+ bought` : 'New'}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── 首页主体 ──

export default function Home() {
  // 分类数据
  const { data: categories, loading: catLoading } = useRequest(
    (signal) => category.tree({ signal }),
  );

  // Banner 数据
  const { data: bannerData, loading: bannerLoading } = useRequest(
    (signal) => bannerApi.list({ signal }),
  );

  // Deal of the Day（销量 Top 10）
  const { data: dealData } = useRequest(
    (signal) => product.list({ page: 1, pageSize: 10, sort: 'sales', order: 'desc', signal }),
  );
  const dealItems = dealData?.items ?? [];

  // 推荐商品（最新，无限滚动）
  const {
    items: products,
    loading: prodLoading,
    loadingMore,
    hasMore,
    loadMore,
  } = usePaginatedRequest(
    (page, pageSize, signal) =>
      product.list({ page, pageSize, sort: 'createdAt', order: 'desc', signal }),
    { pageSize: PAGE_SIZE },
  );

  // Banner: API 优先，无数据用 fallback
  const banners = bannerData && bannerData.length > 0
    ? bannerData.map((b) => ({ id: b.id, title: b.title, imageUrl: b.imageUrl, linkType: b.linkType, linkValue: b.linkValue }))
    : FALLBACK_BANNERS;

  return (
    <div className="amz-home">
      {/* 分类胶囊横滑 */}
      {catLoading ? (
        <PillsSkeleton />
      ) : categories && categories.length > 0 ? (
        <CategoryPills categories={categories} />
      ) : null}

      {/* Banner 轮播 */}
      {bannerLoading ? (
        <Skeleton className="w-full aspect-[75/28]" />
      ) : (
        <BannerCarousel banners={banners} />
      )}

      {/* Deal of the Day */}
      <DealSection items={dealItems} />

      {/* Recommended for you */}
      <div className="amz-section-header">
        <span className="section-title">Recommended for you</span>
      </div>

      <ProductGrid
        items={products}
        loading={prodLoading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
      />

      {/* 底部安全距离 */}
      <div className="h-60" />
    </div>
  );
}
