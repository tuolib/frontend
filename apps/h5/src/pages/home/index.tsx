import { useRef, useEffect, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore, useRequest, usePaginatedRequest } from '@fe/hooks';
import { ROUTES, formatPrice } from '@fe/shared';
import { product, category } from '@fe/api-client';
import { Image, Skeleton, Spinner } from '@fe/ui';
import type { ProductListItem, CategoryNode } from '@fe/shared';
import './home.scss';

const PAGE_SIZE = 10;

// ── Mock 数据（无后端 banner/秒杀接口，用占位数据） ──

const BANNERS = [
  { id: '1', color: '#e4393c', title: '新品首发', subtitle: '爆款直降300元' },
  { id: '2', color: '#7b68ee', title: '超级品牌日', subtitle: '大牌5折起' },
  { id: '3', color: '#ff8c00', title: '限时秒杀', subtitle: '全场低至1折' },
];

const FLASH_ITEMS = [
  { id: 'f1', title: '无线蓝牙耳机', price: '59.9', originPrice: '199', progress: 78 },
  { id: 'f2', title: '纯棉短袖T恤', price: '29.9', originPrice: '89', progress: 65 },
  { id: 'f3', title: '304不锈钢保温杯', price: '39.9', originPrice: '129', progress: 82 },
  { id: 'f4', title: '手机充电线', price: '9.9', originPrice: '39', progress: 91 },
  { id: 'f5', title: '运动双肩包', price: '49.9', originPrice: '159', progress: 55 },
];

// ── Banner 轮播 ──

function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % BANNERS.length);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="jd-banner">
      <div className="banner-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {BANNERS.map((b) => (
          <div key={b.id} className="banner-slide">
            <div
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}dd)` }}
            >
              <span className="text-20 font-bold text-white">{b.title}</span>
              <span className="text-12 text-white/80 mt-4">{b.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="banner-dots">
        {BANNERS.map((b, i) => (
          <div key={b.id} className={`dot ${i === current ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

// ── 分类宫格 ──

function CategoryGrid({ categories }: { categories: CategoryNode[] }) {
  // 取前 10 个分类，分两行五列
  const items = categories.slice(0, 10);

  return (
    <div className="jd-categories">
      <div className="cat-grid">
        {items.map((cat) => (
          <Link key={cat.id} to={`/product?categoryId=${cat.id}`} className="cat-item">
            <div className="cat-icon">
              <Image src={cat.iconUrl ?? undefined} alt={cat.name} />
            </div>
            <span className="cat-name">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="jd-categories">
      <div className="cat-grid">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="cat-item">
            <Skeleton className="w-44 h-44 rounded-full" />
            <Skeleton className="w-32 h-10 rounded-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 秒杀区域 ──

function FlashSale() {
  const [countdown, setCountdown] = useState({ h: 1, m: 23, s: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="jd-flash-sale">
      <div className="flash-header">
        <div className="flash-left">
          <span className="flash-title">京东秒杀</span>
          <div className="flash-countdown">
            <span className="cd-block">{pad(countdown.h)}</span>
            <span>:</span>
            <span className="cd-block">{pad(countdown.m)}</span>
            <span>:</span>
            <span className="cd-block">{pad(countdown.s)}</span>
          </div>
        </div>
        <Link to="/product" className="flash-more">
          更多秒杀 <span className="i-carbon-chevron-right text-10" />
        </Link>
      </div>
      <div className="flash-list">
        {FLASH_ITEMS.map((item) => (
          <Link key={item.id} to="/product" className="flash-item">
            <div className="flash-img">
              <div className="w-full h-full flex-cc bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-10 text-gray-400">{item.title}</span>
              </div>
            </div>
            <div className="flash-price">
              <span className="flash-symbol">¥</span>{item.price}
            </div>
            <div className="flash-origin">¥{item.originPrice}</div>
            <div className="flash-progress">
              <div
                className="absolute inset-y-0 left-0 bg-white/20 rounded-6"
                style={{ width: `${item.progress}%` }}
              />
              <span className="progress-text">已抢{item.progress}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── 功能入口 ──

function FeatureCards() {
  return (
    <div className="jd-features">
      <div className="feature-card" style={{ background: 'linear-gradient(135deg, #fff5f5, #fff)' }}>
        <span className="feature-title">京东超市</span>
        <span className="feature-desc">大牌聚惠</span>
        <div className="feature-img flex-cc bg-red-50 rounded-8">
          <span className="i-carbon-shopping-bag text-24 text-red-400" />
        </div>
      </div>
      <div className="feature-card" style={{ background: 'linear-gradient(135deg, #f0f5ff, #fff)' }}>
        <span className="feature-title">数码电器</span>
        <span className="feature-desc">新品直降</span>
        <div className="feature-img flex-cc bg-blue-50 rounded-8">
          <span className="i-carbon-laptop text-24 text-blue-400" />
        </div>
      </div>
      <div className="feature-card" style={{ background: 'linear-gradient(135deg, #fff7e6, #fff)' }}>
        <span className="feature-title">充值缴费</span>
        <span className="feature-desc">优惠享不停</span>
        <div className="feature-img flex-cc bg-orange-50 rounded-8">
          <span className="i-carbon-flash text-24 text-orange-400" />
        </div>
      </div>
    </div>
  );
}

// ── 商品卡片 ──

function ProductCard({ item }: { item: ProductListItem }) {
  const price = item.minPrice ? Number.parseFloat(item.minPrice).toFixed(1) : '0';
  const [integer, decimal] = price.split('.');
  const tags = ['京东自营', '满减'];

  return (
    <Link to={`/product/${item.id}`} className="product-card">
      <div className="product-img">
        <Image src={item.primaryImage ?? undefined} alt={item.title} className="w-full h-full" />
      </div>
      <div className="product-info">
        <div className="product-title">{item.title}</div>
        <div className="product-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="product-bottom">
          <span className="product-price">
            <span className="price-symbol">¥</span>
            {integer}
            <span className="text-12">.{decimal}</span>
          </span>
          <span className="product-sales">
            {item.totalSales > 0 ? `${item.totalSales}+评论` : '新品'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
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

// ── 首页主体 ──

export default function Home() {
  const navigate = useNavigate();

  const { data: categories, loading: catLoading } = useRequest(
    (signal) => category.tree({ signal }),
  );

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

  // IntersectionObserver 自动加载更多
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

  return (
    <div className="jd-home">
      {/* 顶部搜索栏 */}
      <div className="jd-header">
        <div className="jd-search-bar">
          <span className="i-carbon-scan header-icon" />
          <div className="search-input" onClick={() => navigate('/search')}>
            <span className="i-carbon-search text-14 text-gray-400" />
            <span>搜索商品</span>
          </div>
          <span className="i-carbon-notification header-icon" />
        </div>
      </div>

      {/* 轮播图 */}
      <BannerCarousel />

      {/* 分类宫格 */}
      {catLoading ? (
        <CategorySkeleton />
      ) : categories && categories.length > 0 ? (
        <CategoryGrid categories={categories} />
      ) : null}

      {/* 功能入口 */}
      <FeatureCards />

      {/* 秒杀区域 */}
      <FlashSale />

      {/* 推荐商品 */}
      <div className="jd-recommend-header">
        <div className="rec-line" />
        <span className="rec-title">为你推荐</span>
        <div className="rec-line" />
      </div>

      {prodLoading ? (
        <div className="jd-product-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="jd-product-grid">
            {products.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>

          <div ref={loadMoreRef} className="jd-load-more">
            {hasMore ? (
              loadingMore ? (
                <>
                  <Spinner size="sm" className="text-gray-400" />
                  加载中...
                </>
              ) : (
                <span>上滑加载更多</span>
              )
            ) : (
              <span>- 我是有底线的 -</span>
            )}
          </div>
        </>
      ) : null}

      {/* 底部 TabBar 安全距离 */}
      <div className="h-60" />
    </div>
  );
}
