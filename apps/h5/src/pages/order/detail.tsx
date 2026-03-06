/**
 * OrderDetail — 订单详情页 (Step 8d)
 * 展示订单完整信息 + 状态操作按钮
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRequest } from '@fe/hooks';
import { order, ApiError } from '@fe/api-client';
import { useToast, Skeleton } from '@fe/ui';
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  formatPrice,
  formatDateTime,
} from '@fe/shared';
import type { OrderDetailResult } from '@fe/shared';
import { productPlaceholder } from '@/pages/home/placeholder';
import { PageHeader } from '@/components/page-header';
import '@/styles/order.scss';

function formatSkuAttrs(attrs: unknown): string {
  if (typeof attrs === 'object' && attrs !== null) {
    return Object.values(attrs as Record<string, string>).join(' / ');
  }
  return '';
}

const STATUS_DESC: Record<string, string> = {
  pending: 'Awaiting payment',
  paid: 'Payment confirmed, preparing for shipment',
  shipped: 'Your order is on the way',
  delivered: 'Your order has been delivered',
  completed: 'Order completed',
  cancelled: 'Order has been cancelled',
  refunded: 'Refund processed',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: detail, loading, run: reload } = useRequest(
    () => order.detail(id!),
    { immediate: !!id },
  );

  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!id || cancelling) return;
    setCancelling(true);
    try {
      await order.cancel(id);
      toast('Order cancelled', 'success');
      reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Order Details" />
        <OrderDetailSkeleton />
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <PageHeader title="Order Details" />
        <div className="amz-order-detail">
          <div className="flex-cc flex-col py-60 text-[#565959]">
            <span className="i-carbon-warning-alt text-48 mb-12 text-[#ccc]" />
            <p className="text-14">Order not found</p>
          </div>
        </div>
      </>
    );
  }

  const statusLabel =
    ORDER_STATUS_LABEL[detail.status as keyof typeof ORDER_STATUS_LABEL] || detail.status;
  const statusDesc = STATUS_DESC[detail.status] || '';
  const showActions = detail.status === ORDER_STATUS.PENDING || detail.status === ORDER_STATUS.PAID;

  return (
    <>
      <PageHeader title="Order Details" />
      <div className="amz-order-detail">
        {/* Status Banner */}
        <div className="od-status-banner">
          <div className="od-status-text">{statusLabel}</div>
          <div className="od-status-desc">{statusDesc}</div>
        </div>

        {/* Address */}
        {detail.address && (
          <div className="od-section">
            <div className="od-address">
              <span className="address-icon i-carbon-location" />
              <div className="address-info">
                <div className="address-name-phone">
                  {detail.address.recipient} {detail.address.phone}
                </div>
                <div className="address-detail">
                  {detail.address.province} {detail.address.city} {detail.address.district} {detail.address.address}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="od-section">
          <div className="od-section-title">
            Items ({detail.items.length})
          </div>
          {detail.items.map((item) => (
            <div
              key={item.id}
              className="od-item"
              onClick={() => navigate(`/dp/${item.productId}`)}
            >
              <div className="od-item-img">
                <img
                  src={item.imageUrl || productPlaceholder(item.productTitle)}
                  alt={item.productTitle}
                />
              </div>
              <div className="od-item-info">
                <div className="item-title">{item.productTitle}</div>
                {item.skuAttrs != null && (
                  <div className="item-attrs">
                    {formatSkuAttrs(item.skuAttrs)}
                  </div>
                )}
                <div className="item-price-qty">
                  <span className="item-price">{formatPrice(item.unitPrice)}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="od-section">
          <div className="od-summary">
            <div className="od-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(detail.totalAmount)}</span>
            </div>
            {Number.parseFloat(detail.discountAmount) > 0 && (
              <div className="od-summary-row">
                <span>Discount</span>
                <span className="discount-value">-{formatPrice(detail.discountAmount)}</span>
              </div>
            )}
            <div className="od-summary-row total-row">
              <span className="row-label">Total</span>
              <span>{formatPrice(detail.payAmount)}</span>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="od-section">
          <div className="od-info">
            <div className="od-info-row">
              <span className="info-label">Order No.</span>
              <span className="info-value">{detail.orderNo}</span>
            </div>
            <div className="od-info-row">
              <span className="info-label">Created</span>
              <span className="info-value">{formatDateTime(detail.createdAt)}</span>
            </div>
            {detail.paidAt && (
              <div className="od-info-row">
                <span className="info-label">Paid</span>
                <span className="info-value">{formatDateTime(detail.paidAt)}</span>
              </div>
            )}
            {detail.shippedAt && (
              <div className="od-info-row">
                <span className="info-label">Shipped</span>
                <span className="info-value">{formatDateTime(detail.shippedAt)}</span>
              </div>
            )}
            {detail.deliveredAt && (
              <div className="od-info-row">
                <span className="info-label">Delivered</span>
                <span className="info-value">{formatDateTime(detail.deliveredAt)}</span>
              </div>
            )}
            {detail.cancelledAt && (
              <div className="od-info-row">
                <span className="info-label">Cancelled</span>
                <span className="info-value">{formatDateTime(detail.cancelledAt)}</span>
              </div>
            )}
            {detail.cancelReason && (
              <div className="od-info-row">
                <span className="info-label">Cancel Reason</span>
                <span className="info-value">{detail.cancelReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Remark */}
        {detail.remark && (
          <div className="od-section">
            <div className="od-section-title">Note</div>
            <div className="od-remark">{detail.remark}</div>
          </div>
        )}

        {/* Spacer */}
        <div className="h-20" />
      </div>

      {/* Bottom Action Bar */}
      {showActions && (
        <ActionBar
          status={detail.status}
          orderId={detail.orderId}
          cancelling={cancelling}
          onCancel={handleCancel}
          onPay={() => navigate(`/order/${detail.orderId}/pay`)}
        />
      )}
    </>
  );
}

// ── Action Bar ──

function ActionBar({
  status,
  orderId,
  cancelling,
  onCancel,
  onPay,
}: {
  status: string;
  orderId: string;
  cancelling: boolean;
  onCancel: () => void;
  onPay: () => void;
}) {
  return (
    <div className="od-bottom-bar">
      {(status === ORDER_STATUS.PENDING || status === ORDER_STATUS.PAID) && (
        <button
          className="od-action-btn btn-danger"
          onClick={onCancel}
          disabled={cancelling}
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
      {status === ORDER_STATUS.PENDING && (
        <button className="od-action-btn btn-primary" onClick={onPay}>
          Pay Now
        </button>
      )}
    </div>
  );
}

// ── Skeleton ──

function OrderDetailSkeleton() {
  return (
    <div className="amz-order-detail">
      <div className="od-status-banner">
        <Skeleton className="w-100 h-18 rounded-4 mb-6" />
        <Skeleton className="w-160 h-14 rounded-4" />
      </div>
      <div className="od-section">
        <div className="od-address">
          <Skeleton className="w-20 h-20 rounded-4 flex-shrink-0" />
          <div className="address-info">
            <Skeleton className="w-3/5 h-14 rounded-4 mb-6" />
            <Skeleton className="w-full h-14 rounded-4" />
          </div>
        </div>
      </div>
      <div className="od-section">
        <div className="od-section-title">
          <Skeleton className="w-60 h-16 rounded-4" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="od-item">
            <Skeleton className="w-72 h-72 rounded-6 flex-shrink-0" />
            <div className="od-item-info">
              <Skeleton className="w-full h-14 rounded-4" />
              <Skeleton className="w-3/5 h-12 rounded-4" />
              <Skeleton className="w-2/5 h-16 rounded-4 mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
