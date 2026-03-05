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
};

export const adminOrder = {
  async list(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ items: OrderListItem[]; pagination: PaginationMeta }> {
    return postPaginated<OrderListItem>('/v1/admin/order/list', params);
  },

  async ship(orderId: string, trackingNo?: string): Promise<null> {
    return post<null>('/v1/admin/order/ship', { orderId, trackingNo });
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
