/**
 * 分类域 API
 */

import { post } from '../client';
import type { CategoryNode } from '@fe/shared';

export const category = {
  async list(): Promise<CategoryNode[]> {
    return post<CategoryNode[]>('api/v1/category/list');
  },

  async tree(): Promise<CategoryNode[]> {
    return post<CategoryNode[]>('api/v1/category/tree');
  },

  async detail(id: string): Promise<CategoryNode> {
    return post<CategoryNode>('api/v1/category/detail', { id });
  },
};
