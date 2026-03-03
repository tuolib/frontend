/**
 * HTTP Client — ky 实例 + interceptors
 */

import ky from 'ky';
import type { Options } from 'ky';
import type { ApiResponse } from './types';
import type { PaginationMeta } from '@fe/shared';
import { ApiError } from './errors';
import {
  getAccessToken,
  refreshAccessToken,
  type AuthTokens,
} from './auth-manager';

const DEFAULT_BASE_URL = 'http://localhost:3000';

let _baseUrl: string | undefined;

export function setBaseUrl(url: string): void {
  _baseUrl = url;
}

function getBaseUrl(): string {
  if (_baseUrl) return _baseUrl;
  // Vite 环境下通过 import.meta.env 注入
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return DEFAULT_BASE_URL;
}

export const httpClient = ky.create({
  prefixUrl: getBaseUrl(),
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAccessToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) return response;

        try {
          const tokens = await refreshAccessToken(doRefreshCall);
          request.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
          return ky(request, options);
        } catch {
          return response;
        }
      },
    ],
  },
});

async function doRefreshCall(refreshToken: string): Promise<AuthTokens> {
  const resp = await ky
    .post('api/v1/auth/refresh', {
      prefixUrl: getBaseUrl(),
      json: { refreshToken },
    })
    .json<ApiResponse<{ accessToken: string; refreshToken: string }>>();

  if (!resp.success) {
    throw new ApiError(resp);
  }

  return {
    accessToken: resp.data.accessToken,
    refreshToken: resp.data.refreshToken,
  };
}

/**
 * POST helper — 解包响应信封，失败时抛 ApiError
 */
export async function post<T>(
  path: string,
  body?: Record<string, unknown>,
  options?: Options,
): Promise<T> {
  const response = await httpClient
    .post(path, {
      json: body,
      ...options,
    })
    .json<ApiResponse<T>>();

  if (!response.success) {
    throw new ApiError(response);
  }

  return response.data;
}

/**
 * 分页 POST helper
 */
export async function postPaginated<T>(
  path: string,
  body?: Record<string, unknown>,
  options?: Options,
): Promise<{ items: T[]; pagination: PaginationMeta }> {
  return post<{ items: T[]; pagination: PaginationMeta }>(path, body, options);
}
