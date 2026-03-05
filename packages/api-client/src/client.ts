/**
 * HTTP Client — ky 实例 + interceptors
 */

import ky from 'ky';
import type { Options } from 'ky';
import type { ApiResponse } from './types';
import type { PaginationMeta } from '@fe/shared';
import { ApiError } from './errors';
import {
  ensureFreshToken,
  refreshAccessToken,
  setProactiveRefreshFn,
  type AuthTokens,
} from './auth-manager';

const DEFAULT_BASE_URL = '';

let _baseUrl: string | undefined;

export function setBaseUrl(url: string): void {
  _baseUrl = url;
}

function getBaseUrl(): string {
  if (_baseUrl) return _baseUrl;
  // Vite 环境下通过 import.meta.env 注入（类型安全绕过 — api-client 不依赖 vite）
  // eslint-disable-next-line
  const env = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (env?.VITE_API_BASE_URL) {
    return env.VITE_API_BASE_URL;
  }
  return DEFAULT_BASE_URL;
}

function toKyPath(path: string): string {
  return `api${path.startsWith('/') ? path : `/${path}`}`;
}

async function doRefreshCall(refreshToken: string): Promise<AuthTokens> {
  const resp = await ky
    .post(toKyPath('/v1/auth/refresh'), {
      prefixUrl: getBaseUrl(),
      json: { refreshToken },
    })
    .json<ApiResponse<AuthTokens>>();

  if (!resp.success) {
    throw new ApiError(resp);
  }

  return resp.data;
}

// 注册 refresh 函数，供 auth-manager 主动刷新定时器使用
setProactiveRefreshFn(doRefreshCall);

export const httpClient = ky.create({
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        // 如果 token 即将过期，先等待刷新完成再发请求
        const token = await ensureFreshToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) return response;

        // 兜底：万一主动刷新没来得及，收到 401 后再刷一次
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

/**
 * POST helper — 解包响应信封，失败时抛 ApiError
 * prefixUrl 在每次请求时动态取值，确保 setBaseUrl() 调用后生效
 */
export async function post<T>(
  path: string,
  body?: Record<string, unknown>,
  options?: Options,
): Promise<T> {
  const response = await httpClient
    .post(toKyPath(path), {
      prefixUrl: getBaseUrl(),
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
