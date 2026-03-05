/**
 * ProductDetail — 商品详情页 `/dp/:id`
 * 图片轮播 + 价格 + SKU选择 + 加入购物车
 */

import { useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRequest, useAuthStore } from '@fe/hooks';
import { product, cart } from '@fe/api-client';
import { useToast, Skeleton } from '@fe/ui';
import type { SkuDTO } from '@fe/shared';
import { PageHeader } from '@/components/page-header';
import { productPlaceholder } from '@/pages/home/placeholder';
import '@/styles/detail.scss';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const { data: detail, loading } = useRequest(
    (signal) => product.detail(id!, { signal }),
    { deps: [id] },
  );

  if (loading || !detail) {
    return (
      <div className="amz-detail">
        <PageHeader
          right={
            <button
              className="w-32 h-32 flex-cc text-20 text-[#0f1111]"
              onClick={() => navigate('/cart')}
            >
              <span className="i-carbon-shopping-cart" />
            </button>
          }
        />
        <DetailSkeleton />
      </div>
    );
  }

  return (
    <div className="amz-detail">
      <PageHeader
        right={
          <button
            className="w-32 h-32 flex-cc text-20 text-[#0f1111]"
            onClick={() => navigate('/cart')}
          >
            <span className="i-carbon-shopping-cart" />
          </button>
        }
      />

      <ImageCarousel
        images={detail.images}
        title={detail.title}
      />

      <PriceSection detail={detail} />

      <BottomSection
        detail={detail}
        isAuthenticated={isAuthenticated}
        toast={toast}
        navigate={navigate}
      />
    </div>
  );
}

// ── Image Carousel ──

function ImageCarousel({
  images,
  title,
}: {
  images: { url: string; altText: string | null }[];
  title: string;
}) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);

  const slides = images.length > 0
    ? images.map((img) => img.url)
    : [productPlaceholder(title)];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current < 0 && current < slides.length - 1) {
        setCurrent((p) => p + 1);
      } else if (touchDelta.current > 0 && current > 0) {
        setCurrent((p) => p - 1);
      }
    }
  };

  return (
    <div
      className="detail-carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={trackRef}
        className="carousel-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div key={i} className="carousel-slide">
            <img
              src={src}
              alt={images[i]?.altText || title}
            />
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="carousel-indicator">
          {current + 1} / {slides.length}
        </div>
      )}
    </div>
  );
}

// ── Price Section ──

function PriceSection({ detail }: { detail: { minPrice: string | null; maxPrice: string | null; title: string; avgRating: string; reviewCount: number; totalSales: number } }) {
  const price = detail.minPrice ? Number.parseFloat(detail.minPrice) : 0;
  const integer = Math.floor(price);
  const decimal = ((price - integer) * 100).toFixed(0).padStart(2, '0');

  const comparePrice = detail.maxPrice ? Number.parseFloat(detail.maxPrice) : 0;
  const hasCompare = comparePrice > price && price > 0;
  const discount = hasCompare ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const rating = Number.parseFloat(detail.avgRating || '0');

  return (
    <>
      <div className="detail-price-section">
        <div className="current-price">
          <span className="price-symbol">¥</span>
          <span className="price-integer">{integer.toLocaleString()}</span>
          <span className="price-decimal">.{decimal}</span>
        </div>
        {hasCompare && (
          <div className="compare-row">
            <span className="compare-price">¥{comparePrice.toLocaleString()}</span>
            <span className="discount-badge">-{discount}%</span>
          </div>
        )}
      </div>

      <div className="detail-title-section">
        <div className="product-title">{detail.title}</div>
        <div className="product-rating">
          <div className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`star ${i < Math.round(rating) ? 'star-filled' : 'star-empty'}`}
              >
                &#9733;
              </span>
            ))}
          </div>
          <span className="rating-text">{rating.toFixed(1)}</span>
          {detail.reviewCount > 0 && (
            <span className="sales-text">({detail.reviewCount.toLocaleString()} ratings)</span>
          )}
          {detail.totalSales > 0 && (
            <span className="sales-text">{detail.totalSales.toLocaleString()}+ bought</span>
          )}
        </div>
      </div>
    </>
  );
}

// ── Bottom Section (SKU + Description + Actions) ──

function BottomSection({
  detail,
  isAuthenticated,
  toast,
  navigate,
}: {
  detail: import('@fe/shared').ProductDetail;
  isAuthenticated: boolean;
  toast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const skus = detail.skus.filter((s) => s.status === 'active');

  // Extract attribute dimensions from SKUs
  const dimensions = useMemo(() => {
    const dimMap = new Map<string, Set<string>>();
    for (const sku of skus) {
      if (!sku.attributes) continue;
      for (const [key, val] of Object.entries(sku.attributes)) {
        if (!dimMap.has(key)) dimMap.set(key, new Set());
        dimMap.get(key)!.add(val);
      }
    }
    return Array.from(dimMap.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values),
    }));
  }, [skus]);

  // Selected attributes state
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    if (skus.length === 0) return {};
    // Default: select first SKU's attributes
    const first = skus[0];
    return first.attributes ? { ...first.attributes } : {};
  });

  // Find matched SKU
  const matchedSku = useMemo(() => {
    if (dimensions.length === 0 && skus.length > 0) return skus[0];
    return skus.find((sku) => {
      if (!sku.attributes) return false;
      return dimensions.every(
        (dim) => sku.attributes![dim.key] === selected[dim.key],
      );
    });
  }, [skus, dimensions, selected]);

  // Check if an option is available (has at least one SKU in stock with this attribute)
  const isOptionAvailable = useCallback(
    (dimKey: string, value: string) => {
      return skus.some((sku) => {
        if (!sku.attributes || sku.stock <= 0) return false;
        if (sku.attributes[dimKey] !== value) return false;
        // Check the option is compatible with other selected attributes
        return dimensions.every((dim) => {
          if (dim.key === dimKey) return true;
          if (!selected[dim.key]) return true;
          return sku.attributes![dim.key] === selected[dim.key];
        });
      });
    },
    [skus, dimensions, selected],
  );

  const handleSelect = (dimKey: string, value: string) => {
    setSelected((prev) => ({ ...prev, [dimKey]: value }));
  };

  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!matchedSku || matchedSku.stock <= 0) return;

    setAdding(true);
    try {
      await cart.add(matchedSku.id, 1);
      toast('Added to cart', 'success');
    } catch {
      toast('Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!matchedSku || matchedSku.stock <= 0) return;

    setAdding(true);
    try {
      await cart.add(matchedSku.id, 1);
      navigate('/cart');
    } catch {
      toast('Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const outOfStock = matchedSku ? matchedSku.stock <= 0 : skus.length === 0;

  // Show matched SKU's price if different from product minPrice
  const skuPrice = matchedSku ? Number.parseFloat(matchedSku.price) : null;
  const skuCompare = matchedSku?.comparePrice ? Number.parseFloat(matchedSku.comparePrice) : null;

  return (
    <>
      {/* SKU price override */}
      {skuPrice !== null && (
        <div className="detail-section">
          <div className="flex items-baseline gap-6">
            <span className="text-12 text-[#b12704]">Selected:</span>
            <span className="text-18 font-700 text-[#b12704]">
              ¥{skuPrice.toLocaleString()}
            </span>
            {skuCompare && skuCompare > skuPrice && (
              <span className="text-12 text-[#565959] line-through">
                ¥{skuCompare.toLocaleString()}
              </span>
            )}
            {matchedSku && matchedSku.stock > 0 && matchedSku.stock <= 5 && (
              <span className="text-12 text-[#cc0c39]">
                Only {matchedSku.stock} left
              </span>
            )}
          </div>
        </div>
      )}

      {/* SKU selector */}
      {dimensions.length > 0 && (
        <div className="detail-section detail-sku-section">
          {dimensions.map((dim) => (
            <div key={dim.key} className="sku-group">
              <div className="sku-label">{dim.key}</div>
              <div className="sku-options">
                {dim.values.map((val) => {
                  const available = isOptionAvailable(dim.key, val);
                  const isActive = selected[dim.key] === val;
                  return (
                    <button
                      key={val}
                      className={`sku-option ${isActive ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                      onClick={() => available && handleSelect(dim.key, val)}
                      disabled={!available}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {detail.description && (
        <div className="detail-section detail-desc-section">
          <div className="desc-title">About this item</div>
          <div className="desc-content">{detail.description}</div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="detail-bottom-bar">
        <button
          className={`btn-add-cart ${outOfStock || adding ? 'btn-disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button
          className={`btn-buy-now ${outOfStock || adding ? 'btn-disabled' : ''}`}
          onClick={handleBuyNow}
          disabled={outOfStock || adding}
        >
          Buy Now
        </button>
      </div>
    </>
  );
}

// ── Skeleton ──

function DetailSkeleton() {
  return (
    <div className="detail-skeleton">
      <div className="skeleton-image">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="skeleton-section">
        <Skeleton className="w-2/5 h-28 rounded-4" />
        <div className="h-8" />
        <Skeleton className="w-full h-16 rounded-4" />
        <Skeleton className="w-4/5 h-16 rounded-4 mt-6" />
        <div className="h-12" />
        <Skeleton className="w-3/5 h-14 rounded-4" />
      </div>
    </div>
  );
}
