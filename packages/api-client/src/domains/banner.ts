/**
 * Banner 轮播图域 API
 */

import { post } from '../client';
import type { BannerItem } from '@fe/shared';

interface RequestOptions {
  signal?: AbortSignal;
}

export const banner = {
  async list(options?: RequestOptions): Promise<BannerItem[]> {
    return post<BannerItem[]>('api/v1/banner/list', undefined, options);
  },
};
