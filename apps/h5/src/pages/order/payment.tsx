/**
 * OrderPayment — 支付页 (Step 8b)
 * 选择支付方式并完成支付
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRequest } from '@fe/hooks';
import { order, payment } from '@fe/api-client';
import { useToast, Skeleton } from '@fe/ui';
import { formatPrice } from '@fe/shared';
import { PageHeader } from '@/components/page-header';
import '@/styles/payment.scss';

type PaymentMethod = 'alipay' | 'wechat' | 'mock';

const PAYMENT_METHODS: Array<{
  key: PaymentMethod;
  name: string;
  desc: string;
  icon: string;
}> = [
  { key: 'alipay', name: 'Alipay', desc: 'Pay with Alipay', icon: 'i-carbon-wallet' },
  { key: 'wechat', name: 'WeChat Pay', desc: 'Pay with WeChat', icon: 'i-carbon-chat' },
  { key: 'mock', name: 'Mock Payment', desc: 'Test payment (instant)', icon: 'i-carbon-development' },
];

export default function OrderPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: orderDetail, loading } = useRequest(
    () => order.detail(id!),
    { immediate: !!id },
  );

  const [method, setMethod] = useState<PaymentMethod>('mock');
  const [submitting, setSubmitting] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Countdown timer for order expiration
  useEffect(() => {
    if (!orderDetail?.expiresAt) return;

    function updateCountdown() {
      const now = Date.now();
      const expires = new Date(orderDetail!.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setCountdown('Expired');
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [orderDetail?.expiresAt]);

  const handlePay = useCallback(async () => {
    if (!id || submitting) return;

    if (countdown === 'Expired') {
      toast('Order has expired', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await payment.create({ orderId: id, method });
      setPaySuccess(true);
    } catch {
      toast('Payment failed, please try again', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [id, method, submitting, countdown, toast]);

  if (loading) {
    return (
      <>
        <PageHeader title="Payment" />
        <PaymentSkeleton />
      </>
    );
  }

  if (!orderDetail) {
    return (
      <>
        <PageHeader title="Payment" />
        <div className="amz-payment">
          <div className="flex-cc flex-col py-60 text-[#565959]">
            <span className="i-carbon-warning-alt text-48 mb-12 text-[#ccc]" />
            <p className="text-14">Order not found</p>
          </div>
        </div>
      </>
    );
  }

  // If order is not pending, redirect or show status
  if (orderDetail.status !== 'pending') {
    return (
      <>
        <PageHeader title="Payment" />
        <div className="amz-payment">
          <div className="flex-cc flex-col py-60 text-[#565959]">
            <span className="i-carbon-information text-48 mb-12 text-[#007185]" />
            <p className="text-14">
              {orderDetail.status === 'paid'
                ? 'This order has already been paid'
                : orderDetail.status === 'cancelled'
                  ? 'This order has been cancelled'
                  : 'This order cannot be paid'}
            </p>
            <button
              className="mt-20 text-14 text-[#007185]"
              onClick={() => navigate(`/order/${id}`, { replace: true })}
            >
              View Order Details
            </button>
          </div>
        </div>
      </>
    );
  }

  // Pay success overlay
  if (paySuccess) {
    return (
      <div className="pay-success-overlay">
        <span className="success-icon i-carbon-checkmark-filled" />
        <div className="success-title">Payment Successful</div>
        <div className="success-desc">Your order has been confirmed</div>
        <button
          className="success-btn"
          onClick={() => navigate(`/order/${id}`, { replace: true })}
        >
          View Order
        </button>
        <button
          className="success-btn"
          onClick={() => navigate('/', { replace: true })}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const amount = Number.parseFloat(orderDetail.payAmount);
  const amountInt = Math.floor(amount);
  const amountDec = (amount - amountInt).toFixed(2).slice(1);

  return (
    <>
      <PageHeader title="Payment" />
      <div className="amz-payment">
        {/* Amount */}
        <div className="pay-amount-section">
          <div className="pay-label">Amount to Pay</div>
          <div className="pay-amount">
            <span className="pay-symbol">¥</span>
            {amountInt.toLocaleString()}{amountDec}
          </div>
          <div className="pay-order-no">Order #{orderDetail.orderNo}</div>
          {countdown && countdown !== 'Expired' && (
            <div className="pay-expire">
              Please pay within {countdown}
            </div>
          )}
          {countdown === 'Expired' && (
            <div className="pay-expire">Order has expired</div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="pay-method-section">
          <div className="method-title">Payment Method</div>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.key}
              className="pay-method-item"
              onClick={() => setMethod(m.key)}
            >
              <div className={`method-radio ${method === m.key ? 'checked' : ''}`} />
              <span className={`method-icon ${m.icon}`} />
              <div className="method-info">
                <div className="method-name">{m.name}</div>
                <div className="method-desc">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pay-bottom-bar">
        <button
          className="pay-submit-btn"
          disabled={submitting || countdown === 'Expired'}
          onClick={handlePay}
        >
          {submitting ? 'Processing...' : `Pay ${formatPrice(orderDetail.payAmount)}`}
        </button>
      </div>
    </>
  );
}

// ── Skeleton ──

function PaymentSkeleton() {
  return (
    <div className="amz-payment">
      <div className="pay-amount-section">
        <Skeleton className="w-80 h-14 rounded-4 mx-auto mb-8" />
        <Skeleton className="w-140 h-32 rounded-4 mx-auto mb-8" />
        <Skeleton className="w-120 h-12 rounded-4 mx-auto" />
      </div>
      <div className="pay-method-section">
        <div className="method-title">
          <Skeleton className="w-100 h-16 rounded-4" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pay-method-item" style={{ cursor: 'default' }}>
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="w-24 h-24 rounded-4" />
            <div className="method-info">
              <Skeleton className="w-80 h-14 rounded-4 mb-4" />
              <Skeleton className="w-120 h-12 rounded-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
