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

export const product = {
  async list(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    order?: SortOrder;
    filters?: { status?: string; categoryId?: string; brand?: string };
  }): Promise<{ items: ProductListItem[]; pagination: PaginationMeta }> {
    return postPaginated<ProductListItem>('api/v1/product/list', {
      sort: 'createdAt',
      order: 'desc',
      ...params,
    });
  },

  async detail(id: string): Promise<ProductDetail> {
    return post<ProductDetail>('api/v1/product/detail', { id });
  },

  async search(params: {
    keyword: string;
    categoryId?: string;
    priceMin?: number;
    priceMax?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: ProductListItem[]; pagination: PaginationMeta }> {
    return postPaginated<ProductListItem>('api/v1/product/search', {
      sort: 'relevance',
      ...params,
    });
  },

  async skuList(productId: string): Promise<SkuDTO[]> {
    return post<SkuDTO[]>('api/v1/product/sku/list', { productId });
  },
};
