/**
 * OrderCreate — 订单确认页 (Step 8a)
 * 从购物车结算进入，确认地址/商品/金额后下单
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useRequest } from '@fe/hooks';
import { cart, address, order } from '@fe/api-client';
import { useToast, Skeleton } from '@fe/ui';
import { formatPrice } from '@fe/shared';
import type { UserAddress } from '@fe/shared';
import { productPlaceholder } from '@/pages/home/placeholder';
import { PageHeader } from '@/components/page-header';
import '@/styles/order-create.scss';

export default function OrderCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: preview, loading: previewLoading } = useRequest(
    () => cart.checkoutPreview(),
  );

  const { data: addresses, loading: addressLoading } = useRequest(
    () => address.list(),
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter out unavailable items
  const availableItems = useMemo(() => {
    if (!preview) return [];
    const unavailableSkus = new Set(preview.warnings.unavailableItems.map((w) => w.skuId));
    return preview.items.filter((i) => !unavailableSkus.has(i.skuId));
  }, [preview]);

  // Resolve selected address: user-selected, or default, or first
  const selectedAddress = resolveAddress(addresses, selectedAddressId);

  const handlePlaceOrder = useCallback(async () => {
    if (availableItems.length === 0 || !selectedAddress || submitting) return;

    setSubmitting(true);
    try {
      const items = availableItems.map((i) => ({
        skuId: i.skuId,
        quantity: i.quantity,
      }));
      const result = await order.create({
        items,
        addressId: selectedAddress.id,
        remark: remark.trim() || undefined,
      });
      toast('Order placed successfully', 'success');
      navigate(`/order/${result.orderId}/pay`, { replace: true });
    } catch {
      toast('Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [availableItems, selectedAddress, submitting, remark, navigate, toast]);

  const loading = previewLoading || addressLoading;

  if (loading) {
    return (
      <>
        <PageHeader title="Confirm Order" />
        <OrderCreateSkeleton />
      </>
    );
  }

  if (!preview || availableItems.length === 0) {
    return (
      <>
        <PageHeader title="Confirm Order" />
        <div className="amz-order-create">
          <div className="flex-cc flex-col py-60 text-[#565959]">
            <span className="i-carbon-shopping-cart text-48 mb-12 text-[#ccc]" />
            <p className="text-14">No items to checkout</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Confirm Order" />
      <div className="amz-order-create">
        {/* Address Section */}
        <div className="oc-address-section" onClick={() => {
          if (addresses && addresses.length > 0) {
            setPickerOpen(true);
          } else {
            navigate('/me/address');
          }
        }}>
          {selectedAddress ? (
            <div className="oc-address-row">
              <span className="address-icon i-carbon-location" />
              <div className="address-info">
                <div className="address-name-phone">
                  {selectedAddress.recipient} {selectedAddress.phone}
                </div>
                <div className="address-detail">
                  {selectedAddress.province} {selectedAddress.city} {selectedAddress.district} {selectedAddress.address}
                </div>
              </div>
              <span className="address-arrow i-carbon-chevron-right" />
            </div>
          ) : (
            <div className="oc-no-address">
              <span className="add-icon i-carbon-add-alt" />
              <span>Add shipping address</span>
            </div>
          )}
        </div>

        {/* Warnings (price changed / insufficient only) */}
        {preview.warnings && (preview.warnings.priceChangedItems.length > 0 || preview.warnings.insufficientItems.length > 0) && (
          <div className="oc-warnings">
            {preview.warnings.priceChangedItems.map((w) => (
              <div key={w.skuId} className="warning-item">
                <span className="warning-icon i-carbon-warning-alt" />
                <span>{w.productTitle}: price changed {formatPrice(w.oldPrice)} → {formatPrice(w.newPrice)}</span>
              </div>
            ))}
            {preview.warnings.insufficientItems.map((w) => (
              <div key={w.skuId} className="warning-item">
                <span className="warning-icon i-carbon-warning-alt" />
                <span>{w.productTitle}: only {w.available} left (requested {w.requested})</span>
              </div>
            ))}
          </div>
        )}

        {/* Items (available only) */}
        <div className="oc-items-section">
          <div className="oc-items-title">Items ({availableItems.length})</div>
          {availableItems.map((item) => (
            <div key={item.skuId} className="oc-item">
              <div className="oc-item-img">
                <img
                  src={item.imageUrl || productPlaceholder(item.productTitle)}
                  alt={item.productTitle}
                />
              </div>
              <div className="oc-item-info">
                <div className="item-title">{item.productTitle}</div>
                {item.skuAttrs && (
                  <div className="item-attrs">
                    {Object.values(item.skuAttrs).join(' / ')}
                  </div>
                )}
                <div className="item-price-qty">
                  <span className="item-price">{formatPrice(item.currentPrice)}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Remark */}
        <div className="oc-remark-section">
          <div className="remark-label">Order Note</div>
          <textarea
            className="remark-input"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add a note (optional)"
            maxLength={500}
          />
        </div>

        {/* Summary */}
        <div className="oc-summary-section">
          <div className="oc-summary-row">
            <span>Items Total</span>
            <span>{formatPrice(preview.summary.itemsTotal)}</span>
          </div>
          <div className="oc-summary-row">
            <span>Shipping</span>
            <span>{formatPrice(preview.summary.shippingFee)}</span>
          </div>
          {Number.parseFloat(preview.summary.discountAmount) > 0 && (
            <div className="oc-summary-row">
              <span>Discount</span>
              <span className="discount-value">-{formatPrice(preview.summary.discountAmount)}</span>
            </div>
          )}
          <div className="oc-summary-row total-row">
            <span className="row-label">Order Total</span>
            <span>{formatPrice(preview.summary.payAmount)}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-20" />
      </div>

      {/* Bottom Bar */}
      <div className="oc-bottom-bar">
        <div className="oc-total">
          <span className="total-label">Total:</span>
          <span className="total-amount">{formatPrice(preview.summary.payAmount)}</span>
        </div>
        <button
          className="oc-submit-btn"
          disabled={!selectedAddress || availableItems.length === 0 || submitting}
          onClick={handlePlaceOrder}
        >
          {submitting ? 'Placing...' : 'Place Order'}
        </button>
      </div>

      {/* Address Picker */}
      {pickerOpen && addresses && (
        <AddressPicker
          addresses={addresses}
          selectedId={selectedAddress?.id || null}
          onSelect={(id) => {
            setSelectedAddressId(id);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
          onAddNew={() => {
            setPickerOpen(false);
            navigate('/me/address');
          }}
        />
      )}
    </>
  );
}

// ── Helpers ──

function resolveAddress(
  addresses: UserAddress[] | undefined,
  selectedId: string | null,
): UserAddress | null {
  if (!addresses || addresses.length === 0) return null;
  if (selectedId) {
    const found = addresses.find((a) => a.id === selectedId);
    if (found) return found;
  }
  return addresses.find((a) => a.isDefault) || addresses[0];
}

// ── Address Picker ──

function AddressPicker({
  addresses,
  selectedId,
  onSelect,
  onClose,
  onAddNew,
}: {
  addresses: UserAddress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onAddNew: () => void;
}) {
  return (
    <div className="oc-address-picker">
      <div className="oc-picker-backdrop" onClick={onClose} />
      <div className="oc-picker-sheet">
        <div className="oc-picker-header">
          <span className="picker-title">Select Address</span>
          <button className="picker-close" onClick={onClose}>&times;</button>
        </div>
        <div className="oc-picker-list">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              className={`oc-picker-item ${addr.id === selectedId ? 'selected' : ''}`}
              onClick={() => onSelect(addr.id)}
            >
              <div className={`picker-radio ${addr.id === selectedId ? 'checked' : ''}`} />
              <div className="picker-address-info">
                <div className="picker-name-phone">
                  {addr.recipient} {addr.phone}
                  {addr.isDefault && (
                    <span className="ml-6 text-11 text-[#007185] bg-[#e0f4f7] px-4 py-1 rounded-4">Default</span>
                  )}
                </div>
                <div className="picker-detail">
                  {addr.province} {addr.city} {addr.district} {addr.address}
                </div>
              </div>
            </button>
          ))}
          <button className="oc-picker-item" onClick={onAddNew}>
            <span className="i-carbon-add text-20 text-[#007185]" />
            <span className="text-14 font-600 text-[#007185]">Add new address</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──

function OrderCreateSkeleton() {
  return (
    <div className="amz-order-create">
      <div className="oc-address-section" style={{ cursor: 'default' }}>
        <Skeleton className="w-full h-40 rounded-6" />
      </div>
      <div className="oc-items-section">
        <div className="oc-items-title">
          <Skeleton className="w-80 h-16 rounded-4" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="oc-item">
            <Skeleton className="w-72 h-72 rounded-6 flex-shrink-0" />
            <div className="oc-item-info">
              <Skeleton className="w-full h-14 rounded-4" />
              <Skeleton className="w-3/5 h-12 rounded-4" />
              <Skeleton className="w-2/5 h-16 rounded-4 mt-auto" />
            </div>
          </div>
        ))}
      </div>
      <div className="oc-summary-section">
        <Skeleton className="w-full h-14 rounded-4 mb-8" />
        <Skeleton className="w-full h-14 rounded-4 mb-8" />
        <Skeleton className="w-full h-18 rounded-4" />
      </div>
    </div>
  );
}
