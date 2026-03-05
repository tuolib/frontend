/**
 * Cart — 购物车页面 (Step 6)
 * Tab 页面，登录后显示购物车内容
 */

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useRequest } from '@fe/hooks';
import { cart } from '@fe/api-client';
import { useToast, Skeleton } from '@fe/ui';
import type { CartListItem } from '@fe/shared';
import { productPlaceholder } from '@/pages/home/placeholder';
import '@/styles/cart.scss';

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: items, loading, mutate, run: reload } = useRequest(
    () => cart.list(),
  );

  if (loading) return <CartSkeleton />;

  if (!items || items.length === 0) {
    return <CartEmpty onShop={() => navigate('/')} />;
  }

  return (
    <CartContent
      items={items}
      mutate={mutate}
      reload={reload}
      toast={toast}
      navigate={navigate}
    />
  );
}

// ── Cart Content ──

function CartContent({
  items,
  mutate,
  reload,
  toast,
  navigate,
}: {
  items: CartListItem[];
  mutate: (fn: CartListItem[] | undefined | ((prev: CartListItem[] | undefined) => CartListItem[] | undefined)) => void;
  reload: () => Promise<CartListItem[] | undefined>;
  toast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [operating, setOperating] = useState(false);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const selectedItems = items.filter((i) => i.selected && !i.unavailable);
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = selectedItems.reduce(
    (sum, i) => sum + Number.parseFloat(i.currentPrice) * i.quantity,
    0,
  );
  const allSelected = items.length > 0 && items.filter((i) => !i.unavailable).every((i) => i.selected);

  // ── Select / Deselect ──
  const handleSelect = async (skuId: string, selected: boolean) => {
    mutate((prev) => prev?.map((i) => (i.skuId === skuId ? { ...i, selected } : i)));
    try {
      await cart.select([skuId], selected);
    } catch {
      toast('Failed to update selection', 'error');
      reload();
    }
  };

  const handleSelectAll = async (selected: boolean) => {
    const availableIds = items.filter((i) => !i.unavailable).map((i) => i.skuId);
    if (availableIds.length === 0) return;
    mutate((prev) => prev?.map((i) => (i.unavailable ? i : { ...i, selected })));
    try {
      await cart.select(availableIds, selected);
    } catch {
      toast('Failed to update selection', 'error');
      reload();
    }
  };

  // ── Quantity Update (debounced) ──
  const handleQuantity = (skuId: string, newQty: number) => {
    if (newQty < 0 || newQty > 99) return;

    // Optimistic UI update
    if (newQty === 0) {
      mutate((prev) => prev?.filter((i) => i.skuId !== skuId));
    } else {
      mutate((prev) => prev?.map((i) => (i.skuId === skuId ? { ...i, quantity: newQty } : i)));
    }

    // Debounce API call
    const existing = debounceTimers.current.get(skuId);
    if (existing) clearTimeout(existing);

    debounceTimers.current.set(
      skuId,
      setTimeout(async () => {
        debounceTimers.current.delete(skuId);
        try {
          await cart.update(skuId, newQty);
        } catch {
          toast('Failed to update quantity', 'error');
          reload();
        }
      }, 300),
    );
  };

  // ── Delete ──
  const handleDelete = async (skuId: string) => {
    mutate((prev) => prev?.filter((i) => i.skuId !== skuId));
    try {
      await cart.remove([skuId]);
    } catch {
      toast('Failed to remove item', 'error');
      reload();
    }
  };

  // ── Checkout ──
  const handleCheckout = useCallback(async () => {
    if (selectedItems.length === 0 || operating) return;
    setOperating(true);
    try {
      navigate('/order/create');
    } finally {
      setOperating(false);
    }
  }, [selectedItems.length, operating, navigate]);

  return (
    <div className="amz-cart">
      {/* Header */}
      <div className="cart-header">
        <span className="cart-title">
          Shopping Cart ({items.length})
        </span>
      </div>

      {/* Items */}
      {items.map((item) => (
        <CartItem
          key={item.skuId}
          item={item}
          onSelect={handleSelect}
          onQuantity={handleQuantity}
          onDelete={handleDelete}
        />
      ))}

      {/* Spacer for bottom bars */}
      <div className="h-110" />

      {/* Bottom Bar */}
      <div className="cart-bottom-bar">
        <label className="cart-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span>All</span>
        </label>
        <div className="cart-subtotal">
          <span className="subtotal-label">
            Subtotal ({selectedCount} {selectedCount === 1 ? 'item' : 'items'}):
          </span>
          <span className="subtotal-amount">
            ¥{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <button
          className={`cart-checkout-btn ${selectedItems.length === 0 ? 'disabled' : ''}`}
          onClick={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

// ── Cart Item ──

function CartItem({
  item,
  onSelect,
  onQuantity,
  onDelete,
}: {
  item: CartListItem;
  onSelect: (skuId: string, selected: boolean) => void;
  onQuantity: (skuId: string, qty: number) => void;
  onDelete: (skuId: string) => void;
}) {
  const price = Number.parseFloat(item.currentPrice);
  const attrs = item.snapshot.skuAttrs;
  const attrText = attrs ? Object.values(attrs).join(' / ') : '';

  return (
    <div className={`cart-item ${item.unavailable ? 'unavailable' : ''}`}>
      <div className="cart-checkbox">
        <input
          type="checkbox"
          checked={item.selected}
          disabled={item.unavailable}
          onChange={(e) => onSelect(item.skuId, e.target.checked)}
        />
      </div>

      <div className="cart-item-img">
        <img
          src={item.snapshot.imageUrl || productPlaceholder(item.snapshot.productTitle)}
          alt={item.snapshot.productTitle}
        />
      </div>

      <div className="cart-item-info">
        <div className="cart-item-title">{item.snapshot.productTitle}</div>
        {attrText && <div className="cart-item-attrs">{attrText}</div>}

        <div className="cart-item-price">
          <span className="price-symbol">¥</span>
          {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        {item.unavailable && (
          <div className="cart-item-warning">Currently unavailable</div>
        )}
        {item.priceChanged && !item.unavailable && (
          <div className="cart-item-warning">Price has changed</div>
        )}
        {item.stockInsufficient && !item.unavailable && (
          <div className="cart-item-warning">
            Only {item.currentStock} left in stock
          </div>
        )}

        <div className="cart-item-bottom">
          <div className="qty-stepper">
            <button
              disabled={item.unavailable || item.quantity <= 1}
              onClick={() => onQuantity(item.skuId, item.quantity - 1)}
            >
              -
            </button>
            <span className="qty-value">{item.quantity}</span>
            <button
              disabled={item.unavailable || item.quantity >= Math.min(99, item.currentStock)}
              onClick={() => onQuantity(item.skuId, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <button
            className="cart-delete-btn"
            onClick={() => onDelete(item.skuId)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ──

function CartEmpty({ onShop }: { onShop: () => void }) {
  return (
    <div className="amz-cart">
      <div className="cart-header">
        <span className="cart-title">Shopping Cart</span>
      </div>
      <div className="cart-empty">
        <span className="empty-icon i-carbon-shopping-cart" />
        <div className="empty-title">Your cart is empty</div>
        <div className="empty-desc">
          Browse our products and find something you love
        </div>
        <button className="empty-shop-btn" onClick={onShop}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// ── Skeleton ──

function CartSkeleton() {
  return (
    <div className="amz-cart">
      <div className="cart-header">
        <Skeleton className="w-120 h-18 rounded-4" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="cart-item">
          <div className="cart-checkbox">
            <Skeleton className="w-20 h-20 rounded-4" />
          </div>
          <Skeleton className="w-88 h-88 rounded-8 flex-shrink-0" />
          <div className="cart-item-info">
            <Skeleton className="w-full h-14 rounded-4" />
            <Skeleton className="w-3/5 h-12 rounded-4" />
            <Skeleton className="w-2/5 h-16 rounded-4" />
            <div className="h-12" />
            <Skeleton className="w-92 h-28 rounded-6" />
          </div>
        </div>
      ))}
    </div>
  );
}
