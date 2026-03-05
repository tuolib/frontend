/**
 * 订单域 API
 */

import { post, postPaginated } from '../client';
import { generateIdempotencyKey } from '../idempotency';
import type {
  CreateOrderResult,
  OrderListItem,
  OrderDetailResult,
  PaginationMeta,
} from '@fe/shared';

export const order = {
  async create(input: {
    items: Array<{ skuId: string; quantity: number }>;
    addressId: string;
    remark?: string;
  }): Promise<CreateOrderResult> {
    return post<CreateOrderResult>('/v1/order/create', input, {
      headers: { 'X-Idempotency-Key': generateIdempotencyKey() },
    });
  },

  async list(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ items: OrderListItem[]; pagination: PaginationMeta }> {
    return postPaginated<OrderListItem>('/v1/order/list', params);
  },

  async detail(orderId: string): Promise<OrderDetailResult> {
    return post<OrderDetailResult>('/v1/order/detail', { orderId });
  },

  async cancel(orderId: string, reason?: string): Promise<null> {
    return post<null>('/v1/order/cancel', { orderId, reason });
  },
};
