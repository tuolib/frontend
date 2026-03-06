import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRequest, usePaginatedRequest } from '@fe/hooks';
import { product, category, banner as bannerApi } from '@fe/api-client';
import { Skeleton } from '@fe/ui';
import type { ProductListItem, BannerItem, CategoryNode } from '@fe/shared';
import { getCategoryEmoji } from '@/constants/category-emoji';
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

// ── Banner 轮播（支持手势滑动） ──

function BannerCarousel({ banners }: { banners: Array<Pick<BannerItem, 'id' | 'imageUrl' | 'title' | 'linkType' | 'linkValue'>> }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const touchRef = useRef({ startX: 0, startY: 0, moving: false });
  const trackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const startAutoPlay = useCallback(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 3000);
  }, [banners.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  const onTouchStart = (e: React.TouchEvent) => {
    stopAutoPlay();
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, moving: true };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current.moving) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = e.changedTouches[0].clientY - touchRef.current.startY;
    touchRef.current.moving = false;

    // 水平滑动幅度大于垂直才切换
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        setCurrent((c) => Math.min(c + 1, banners.length - 1));
      } else {
        setCurrent((c) => Math.max(c - 1, 0));
      }
    }
    startAutoPlay();
  };

  const handleClick = (b: Pick<BannerItem, 'linkType' | 'linkValue'>) => {
    if (!b.linkValue) return;
    if (b.linkType === 'product') {
      navigate(`/dp/${b.linkValue}`);
    } else if (b.linkType === 'category') {
      navigate(`/product?categoryId=${b.linkValue}`);
    }
  };

  return (
    <div
      className="amz-banner"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={trackRef}
        className="banner-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
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

// ── 分类金刚区（2行5列圆形图标网格） ──

function CategoryGrid({ categories }: { categories: CategoryNode[] }) {
  return (
    <div className="amz-category-grid">
      <div className="category-grid-scroll">
        {categories.map((cat) => {
          const emoji = getCategoryEmoji(cat.slug, cat.iconUrl);
          return (
            <Link key={cat.id} to={`/product?categoryId=${cat.id}`} className="category-grid-item">
              <div className="category-grid-icon">
                {emoji || cat.name.charAt(0)}
              </div>
              <span className="category-grid-name">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="amz-category-grid">
      <div className="category-grid-scroll">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="category-grid-item">
            <Skeleton className="category-grid-icon-skeleton" />
            <Skeleton className="w-40 h-12 mt-6 rounded-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 倒计时 Hook ──

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return '00:00:00';
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

// ── Deal of the Day（销量 Top + 倒计时） ──

function DealSection({ items }: { items: ProductListItem[] }) {
  const countdown = useCountdown();

  if (items.length === 0) return null;

  return (
    <div className="amz-deals">
      <div className="deals-header">
        <div className="deals-header-left">
          <span className="deals-title">Deal of the Day</span>
          <div className="deals-countdown">
            <span className="i-carbon-time text-12" />
            <span>{countdown}</span>
          </div>
        </div>
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
      {/* 分类金刚区 */}
      {catLoading ? (
        <CategoryGridSkeleton />
      ) : categories && categories.length > 0 ? (
        <CategoryGrid categories={categories} />
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
      <div className="amz-recommend-header">
        <span className="recommend-title">Recommended for you</span>
        <Link to="/product" className="recommend-more">
          See more <span className="i-carbon-chevron-right text-12" />
        </Link>
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
