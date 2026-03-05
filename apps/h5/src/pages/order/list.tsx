/**
 * OrderList — 订单列表页 (Step 8c)
 * Tab 切换状态筛选 + 无限滚动
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRequest } from '@fe/hooks';
import { order } from '@fe/api-client';
import { Skeleton } from '@fe/ui';
import {
  ORDER_STATUS_LABEL,
  formatPrice,
  formatDate,
} from '@fe/shared';
import type { OrderListItem } from '@fe/shared';
import { productPlaceholder } from '@/pages/home/placeholder';
import { PageHeader } from '@/components/page-header';
import '@/styles/order.scss';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 10;

export default function OrderList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const { loading, run: fetchOrders } = useRequest(
    () => order.list({ page: 1, pageSize: PAGE_SIZE, status: activeTab || undefined }),
    {
      deps: [activeTab],
      onSuccess(res) {
        setOrders(res.items);
        setPage(1);
        setHasMore(res.items.length >= PAGE_SIZE);
      },
    },
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await order.list({
        page: nextPage,
        pageSize: PAGE_SIZE,
        status: activeTab || undefined,
      });
      setOrders((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(res.items.length >= PAGE_SIZE);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [page, activeTab, loadingMore, hasMore]);

  // Infinite scroll observer
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  function handleTabChange(status: string) {
    if (status === activeTab) return;
    setActiveTab(status);
    setOrders([]);
    setHasMore(true);
  }

  return (
    <>
      <PageHeader title="Your Orders" />
      <div className="amz-order-list">
        {/* Status Tabs */}
        <div className="ol-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`ol-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <OrderListSkeleton />
        ) : orders.length === 0 ? (
          <div className="ol-empty">
            <span className="empty-icon i-carbon-shopping-bag" />
            <div className="empty-title">No orders found</div>
            <div className="empty-desc">
              {activeTab ? 'No orders with this status' : 'You haven\'t placed any orders yet'}
            </div>
          </div>
        ) : (
          <>
            {orders.map((item) => (
              <OrderCard
                key={item.orderId}
                order={item}
                onClick={() => navigate(`/order/${item.orderId}`)}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={observerRef} />

            {loadingMore && (
              <div className="ol-loading-more">Loading...</div>
            )}

            {!hasMore && orders.length > 0 && (
              <div className="ol-loading-more">No more orders</div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ── Order Card ──

function OrderCard({
  order: item,
  onClick,
}: {
  order: OrderListItem;
  onClick: () => void;
}) {
  const statusLabel =
    ORDER_STATUS_LABEL[item.status as keyof typeof ORDER_STATUS_LABEL] || item.status;
  const imgSrc =
    item.firstItem?.imageUrl ||
    productPlaceholder(item.firstItem?.productTitle || 'Order');

  return (
    <div className="ol-card" onClick={onClick}>
      <div className="ol-card-header">
        <span className="ol-order-no">#{item.orderNo}</span>
        <span className={`ol-order-status status-${item.status}`}>
          {statusLabel}
        </span>
      </div>
      <div className="ol-card-item">
        <div className="ol-item-img">
          <img
            src={imgSrc}
            alt={item.firstItem?.productTitle || ''}
          />
        </div>
        <div className="ol-item-info">
          <div className="ol-item-title">
            {item.firstItem?.productTitle || 'Order'}
          </div>
          {item.itemCount > 1 && (
            <div className="ol-item-count">
              +{item.itemCount - 1} more {item.itemCount - 1 === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>
      </div>
      <div className="ol-card-footer">
        <span className="ol-amount">{formatPrice(item.payAmount)}</span>
        <span className="ol-date">{formatDate(item.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Skeleton ──

function OrderListSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="ol-card">
          <div className="ol-card-header">
            <Skeleton className="w-100 h-14 rounded-4" />
            <Skeleton className="w-48 h-18 rounded-4" />
          </div>
          <div className="ol-card-item">
            <Skeleton className="w-64 h-64 rounded-6 flex-shrink-0" />
            <div className="ol-item-info">
              <Skeleton className="w-full h-14 rounded-4" />
              <Skeleton className="w-3/5 h-12 rounded-4 mt-4" />
            </div>
          </div>
          <div className="ol-card-footer">
            <Skeleton className="w-60 h-16 rounded-4" />
            <Skeleton className="w-72 h-12 rounded-4" />
          </div>
        </div>
      ))}
    </>
  );
}
