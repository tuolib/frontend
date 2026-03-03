/**
 * 购物车域 API
 */

import { post } from '../client';
import type { CartListItem, CheckoutPreview } from '@fe/shared';

export const cart = {
  async add(skuId: string, quantity: number): Promise<null> {
    return post<null>('api/v1/cart/add', { skuId, quantity });
  },

  async list(): Promise<CartListItem[]> {
    return post<CartListItem[]>('api/v1/cart/list');
  },

  async update(skuId: string, quantity: number): Promise<null> {
    return post<null>('api/v1/cart/update', { skuId, quantity });
  },

  async remove(skuIds: string[]): Promise<null> {
    return post<null>('api/v1/cart/remove', { skuIds });
  },

  async clear(): Promise<null> {
    return post<null>('api/v1/cart/clear');
  },

  async select(skuIds: string[], selected: boolean): Promise<null> {
    return post<null>('api/v1/cart/select', { skuIds, selected });
  },

  async checkoutPreview(): Promise<CheckoutPreview> {
    return post<CheckoutPreview>('api/v1/cart/checkout/preview');
  },
};
