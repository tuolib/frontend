/**
 * 分类域 API
 */

import { post } from '../client';
import type { CategoryNode } from '@fe/shared';

interface RequestOptions {
  signal?: AbortSignal;
}

export const category = {
  async list(options?: RequestOptions): Promise<CategoryNode[]> {
    return post<CategoryNode[]>('api/v1/category/list', undefined, options);
  },

  async tree(options?: RequestOptions): Promise<CategoryNode[]> {
    return post<CategoryNode[]>('api/v1/category/tree', undefined, options);
  },

  async detail(id: string, options?: RequestOptions): Promise<CategoryNode> {
    return post<CategoryNode>('api/v1/category/detail', { id }, options);
  },
};
