/**
 * Admin 管理域 API
 */

import { post, postPaginated } from '../client';
import type {
  ProductDetail,
  ProductListItem,
  SkuDTO,
  CategoryNode,
  OrderListItem,
  PaginationMeta,
  StaffListItem,
  AdminOrderDetail,
  AdminUserListItem,
  AdminUserDetail,
} from '@fe/shared';

export const adminProduct = {
  async list(params: {
    page?: number;
    pageSize?: number;
    sort?: 'createdAt' | 'price' | 'sales';
    order?: 'asc' | 'desc';
    keyword?: string;
    filters?: {
      status?: 'active' | 'draft' | 'archived';
      categoryId?: string;
      brand?: string;
    };
  }): Promise<{ items: ProductListItem[]; pagination: PaginationMeta }> {
    return postPaginated<ProductListItem>('/v1/admin/product/list', params);
  },

  async detail(id: string): Promise<ProductDetail> {
    return post<ProductDetail>('/v1/admin/product/detail', { id });
  },

  async toggleStatus(id: string, status: 'active' | 'draft' | 'archived'): Promise<ProductDetail> {
    return post<ProductDetail>('/v1/admin/product/toggle-status', { id, status });
  },

  async create(input: {
    title: string;
    slug?: string;
    description?: string;
    brand?: string;
    status?: 'draft' | 'active';
    attributes?: Record<string, unknown>;
    categoryIds: string[];
    images?: Array<{
      url: string;
      altText?: string;
      isPrimary?: boolean;
      sortOrder?: number;
    }>;
  }): Promise<ProductDetail> {
    return post<ProductDetail>('/v1/admin/product/create', input);
  },

  async update(input: {
    id: string;
    title?: string;
    slug?: string;
    description?: string;
    brand?: string;
    status?: 'draft' | 'active' | 'archived';
    attributes?: Record<string, unknown>;
    categoryIds?: string[];
    images?: Array<{
      url: string;
      altText?: string;
      isPrimary?: boolean;
      sortOrder?: number;
    }>;
  }): Promise<ProductDetail> {
    return post<ProductDetail>('/v1/admin/product/update', input);
  },

  async remove(id: string): Promise<null> {
    return post<null>('/v1/admin/product/delete', { id });
  },

  async createSku(input: {
    productId: string;
    skuCode: string;
    price: number;
    comparePrice?: number;
    costPrice?: number;
    stock?: number;
    lowStock?: number;
    weight?: number;
    attributes: Record<string, string>;
    barcode?: string;
  }): Promise<SkuDTO> {
    return post<SkuDTO>('/v1/admin/product/sku/create', input);
  },

  async updateSku(input: {
    skuId: string;
    price?: number;
    comparePrice?: number | null;
    costPrice?: number | null;
    lowStock?: number;
    weight?: number | null;
    attributes?: Record<string, string>;
    barcode?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<SkuDTO> {
    return post<SkuDTO>('/v1/admin/product/sku/update', input);
  },

  async deleteSku(skuId: string): Promise<null> {
    return post<null>('/v1/admin/product/sku/delete', { skuId });
  },

  async addImages(productId: string, images: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>): Promise<ProductDetail> {
    return post<ProductDetail>('/v1/admin/product/image/add', { productId, images });
  },

  async deleteImage(imageId: string): Promise<null> {
    return post<null>('/v1/admin/product/image/delete', { imageId });
  },

  async sortImages(productId: string, imageIds: string[]): Promise<ProductDetail> {
    return post<ProductDetail>('/v1/admin/product/image/sort', { productId, imageIds });
  },
};

export const adminCategory = {
  async tree(): Promise<CategoryNode[]> {
    return post<CategoryNode[]>('/v1/admin/category/tree', {});
  },

  async list(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    isActive?: boolean;
    parentId?: string | null;
  }): Promise<{ items: CategoryNode[]; pagination: PaginationMeta }> {
    return postPaginated<CategoryNode>('/v1/admin/category/list', params);
  },

  async create(input: {
    name: string;
    slug?: string;
    parentId?: string;
    iconUrl?: string;
    sortOrder?: number;
  }): Promise<CategoryNode> {
    return post<CategoryNode>('/v1/admin/category/create', input);
  },

  async update(input: {
    id: string;
    name?: string;
    slug?: string;
    parentId?: string | null;
    iconUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<CategoryNode> {
    return post<CategoryNode>('/v1/admin/category/update', input);
  },

  async remove(id: string): Promise<null> {
    return post<null>('/v1/admin/category/delete', { id });
  },
};

export const adminOrder = {
  async list(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ items: OrderListItem[]; pagination: PaginationMeta }> {
    return postPaginated<OrderListItem>('/v1/admin/order/list', params);
  },

  async detail(orderId: string): Promise<AdminOrderDetail> {
    return post<AdminOrderDetail>('/v1/admin/order/detail', { orderId });
  },

  async ship(orderId: string, trackingNo?: string): Promise<null> {
    return post<null>('/v1/admin/order/ship', { orderId, trackingNo });
  },

  async cancel(orderId: string, reason?: string): Promise<null> {
    return post<null>('/v1/admin/order/cancel', { orderId, reason });
  },

  async refund(orderId: string, reason?: string): Promise<null> {
    return post<null>('/v1/admin/order/refund', { orderId, reason });
  },
};

export const adminStock = {
  async adjust(input: {
    skuId: string;
    quantity: number;
    reason?: string;
  }): Promise<null> {
    return post<null>('/v1/admin/stock/adjust', input);
  },
};

export const adminManage = {
  async list(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }): Promise<{ items: StaffListItem[]; pagination: PaginationMeta }> {
    return postPaginated<StaffListItem>('/v1/admin/manage/list', params);
  },

  async create(input: {
    username: string;
    password: string;
    realName?: string;
    phone?: string;
    email?: string;
    role?: 'admin' | 'operator' | 'viewer';
  }): Promise<StaffListItem> {
    return post<StaffListItem>('/v1/admin/manage/create', input);
  },

  async update(input: {
    id: string;
    realName?: string;
    phone?: string;
    email?: string;
    role?: 'admin' | 'operator' | 'viewer';
  }): Promise<StaffListItem> {
    return post<StaffListItem>('/v1/admin/manage/update', input);
  },

  async toggleStatus(id: string, status: 'active' | 'disabled'): Promise<null> {
    return post<null>('/v1/admin/manage/toggle-status', { id, status });
  },

  async resetPassword(id: string, newPassword: string): Promise<null> {
    return post<null>('/v1/admin/manage/reset-password', { id, newPassword });
  },
};

export const adminUser = {
  async list(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: 'active' | 'banned';
  }): Promise<{ items: AdminUserListItem[]; pagination: PaginationMeta }> {
    return postPaginated<AdminUserListItem>('/v1/admin/user/list', params);
  },

  async detail(id: string): Promise<AdminUserDetail> {
    return post<AdminUserDetail>('/v1/admin/user/detail', { id });
  },

  async toggleStatus(id: string, status: 'active' | 'banned'): Promise<null> {
    return post<null>('/v1/admin/user/toggle-status', { id, status });
  },
};
