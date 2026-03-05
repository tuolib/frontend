/**
 * 支付域 API
 */

import { post } from '../client';
import { generateIdempotencyKey } from '../idempotency';
import type { PaymentInfo, PaymentStatusResult } from '@fe/shared';

export const payment = {
  async create(input: {
    orderId: string;
    method?: 'stripe' | 'alipay' | 'wechat' | 'mock';
  }): Promise<PaymentInfo> {
    return post<PaymentInfo>('/v1/payment/create', input, {
      headers: { 'X-Idempotency-Key': generateIdempotencyKey() },
    });
  },

  async query(orderId: string): Promise<PaymentStatusResult> {
    return post<PaymentStatusResult>('/v1/payment/query', { orderId });
  },
};
