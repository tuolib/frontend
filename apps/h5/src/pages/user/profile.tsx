/**
 * Profile — "You" 个人中心页面 (Step 7)
 * Amazon "Your Account" 风格
 */

import { Link, useNavigate } from 'react-router';
import { useToast, Skeleton } from '@fe/ui';
import { useAuthStore, useRequest } from '@fe/hooks';
import { order } from '@fe/api-client';
import {
  ROUTES,
  ORDER_STATUS_LABEL,
  formatPrice,
  formatDate,
} from '@fe/shared';
import type { OrderListItem } from '@fe/shared';
import { productPlaceholder } from '@/pages/home/placeholder';
import '@/styles/profile.scss';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  // Fetch profile on mount if authenticated but no user data
  useRequest(() => fetchProfile(), {
    immediate: isAuthenticated && !user,
  });

  // Fetch recent orders (only when authenticated)
  const { data: recentOrders, loading: ordersLoading } = useRequest(
    () => order.list({ page: 1, pageSize: 3 }),
    { immediate: isAuthenticated },
  );

  async function handleLogout() {
    try {
      await logout();
      toast('Signed out successfully', 'success');
      navigate(ROUTES.HOME, { replace: true });
    } catch {
      toast('Sign out failed, please try again', 'error');
    }
  }

  if (!isAuthenticated) {
    return <GuestView />;
  }

  const displayName = user?.nickname || user?.email?.split('@')[0] || 'User';

  return (
    <div className="amz-profile">
      {/* Greeting */}
      <div className="profile-greeting">
        <span className="greeting-text">Hello, {displayName}</span>
      </div>

      {/* Quick Actions Grid */}
      <div className="profile-actions">
        <ActionCard
          icon="i-carbon-delivery"
          label="Your Orders"
          onClick={() => navigate(ROUTES.ORDER_LIST)}
        />
        <ActionCard
          icon="i-carbon-location"
          label="Your Addresses"
          onClick={() => navigate(ROUTES.ADDRESS)}
        />
        <ActionCard
          icon="i-carbon-user-profile"
          label="Account"
          onClick={() => {}}
        />
        <ActionCard
          icon="i-carbon-logout"
          label="Sign Out"
          onClick={handleLogout}
        />
      </div>

      {/* Recent Orders */}
      <div className="profile-section">
        <div className="section-header">
          <span className="section-title">Your Orders</span>
          <Link to={ROUTES.ORDER_LIST} className="section-link">
            See all orders
          </Link>
        </div>

        {ordersLoading ? (
          <OrdersSkeleton />
        ) : recentOrders?.items && recentOrders.items.length > 0 ? (
          <div className="orders-list">
            {recentOrders.items.map((item) => (
              <OrderCard
                key={item.orderId}
                order={item}
                onClick={() => navigate(`/order/${item.orderId}`)}
              />
            ))}
          </div>
        ) : (
          <div className="orders-empty">
            <span className="i-carbon-shopping-bag empty-icon" />
            <p>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Guest View ──

function GuestView() {
  return (
    <div className="amz-profile">
      <div className="profile-greeting guest">
        <span className="greeting-text">Hello</span>
        <p className="greeting-subtitle">Sign in for the best experience</p>
      </div>
      <Link to={ROUTES.LOGIN} className="profile-signin-btn">
        Sign in
      </Link>
      <div className="profile-register">
        <span>New customer? </span>
        <Link to={ROUTES.REGISTER} className="register-link">Start here</Link>
      </div>
    </div>
  );
}

// ── Action Card ──

function ActionCard({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="action-card" onClick={onClick}>
      <span className={`action-icon ${icon}`} />
      <span className="action-label">{label}</span>
    </button>
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
  const statusLabel = ORDER_STATUS_LABEL[item.status as keyof typeof ORDER_STATUS_LABEL] || item.status;
  const imgSrc = item.firstItem?.imageUrl || productPlaceholder(item.firstItem?.productTitle || 'Order');

  return (
    <button type="button" className="order-card" onClick={onClick}>
      <div className="order-card-img">
        <img src={imgSrc} alt={item.firstItem?.productTitle || ''} />
      </div>
      <div className="order-card-info">
        <div className="order-card-header">
          <span className="order-no">#{item.orderNo.slice(-8)}</span>
          <span className={`order-status status-${item.status}`}>{statusLabel}</span>
        </div>
        <div className="order-card-title">
          {item.firstItem?.productTitle || 'Order'}
          {item.itemCount > 1 && <span className="item-count"> +{item.itemCount - 1} more</span>}
        </div>
        <div className="order-card-bottom">
          <span className="order-amount">{formatPrice(item.payAmount)}</span>
          <span className="order-date">{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </button>
  );
}

// ── Skeletons ──

function OrdersSkeleton() {
  return (
    <div className="orders-list">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="order-card skeleton">
          <Skeleton className="w-64 h-64 rounded-8 flex-shrink-0" />
          <div className="order-card-info">
            <Skeleton className="w-3/5 h-14 rounded-4" />
            <Skeleton className="w-full h-14 rounded-4" />
            <Skeleton className="w-2/5 h-14 rounded-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
