/**
 * 地址域 API
 */

import { post } from '../client';
import type { UserAddress } from '@fe/shared';

export const address = {
  async list(): Promise<UserAddress[]> {
    return post<UserAddress[]>('/v1/user/address/list');
  },

  async create(input: {
    label?: string;
    recipient: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    postalCode?: string;
    isDefault?: boolean;
  }): Promise<UserAddress> {
    return post<UserAddress>('/v1/user/address/create', input);
  },

  async update(input: {
    id: string;
    label?: string;
    recipient?: string;
    phone?: string;
    province?: string;
    city?: string;
    district?: string;
    address?: string;
    postalCode?: string;
    isDefault?: boolean;
  }): Promise<UserAddress> {
    return post<UserAddress>('/v1/user/address/update', input);
  },

  async remove(id: string): Promise<null> {
    return post<null>('/v1/user/address/delete', { id });
  },
};
