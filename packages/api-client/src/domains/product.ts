/**
 * 商品域 API
 */

import { post, postPaginated } from '../client';
import type {
  ProductListItem,
  ProductDetail,
  SkuDTO,
  PaginationMeta,
  SortOrder,
} from '@fe/shared';

interface RequestOptions {
  signal?: AbortSignal;
}

export const product = {
  async list(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    order?: SortOrder;
    filters?: { status?: string; categoryId?: string; brand?: string };
    signal?: AbortSignal;
  }): Promise<{ items: ProductListItem[]; pagination: PaginationMeta }> {
    const { signal, ...body } = params;
    return postPaginated<ProductListItem>('/v1/product/list', {
      sort: 'createdAt',
      order: 'desc',
      ...body,
    }, signal ? { signal } : undefined);
  },

  async detail(id: string, options?: RequestOptions): Promise<ProductDetail> {
    return post<ProductDetail>('/v1/product/detail', { id }, options);
  },

  async search(params: {
    keyword: string;
    categoryId?: string;
    priceMin?: number;
    priceMax?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
    signal?: AbortSignal;
  }): Promise<{ items: ProductListItem[]; pagination: PaginationMeta }> {
    const { signal, ...body } = params;
    return postPaginated<ProductListItem>('/v1/product/search', {
      sort: 'relevance',
      ...body,
    }, signal ? { signal } : undefined);
  },

  async skuList(productId: string, options?: RequestOptions): Promise<SkuDTO[]> {
    return post<SkuDTO[]>('/v1/product/sku/list', { productId }, options);
  },
};
