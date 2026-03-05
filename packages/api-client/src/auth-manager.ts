/**
 * Token 管理 — 存取 + 刷新去重
 */

import { getStorageItem, setStorageItem, removeStorageItem } from '@fe/shared';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthCallbacks {
  onTokenRefreshed?: (tokens: AuthTokens) => void;
  onAuthExpired?: () => void;
}

let callbacks: AuthCallbacks = {};

export function setAuthCallbacks(cb: AuthCallbacks): void {
  callbacks = cb;
}

export function getAccessToken(): string | null {
  return getStorageItem<string>(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getStorageItem<string>(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  setStorageItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  setStorageItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  removeStorageItem(ACCESS_TOKEN_KEY);
  removeStorageItem(REFRESH_TOKEN_KEY);
}

/**
 * Token 刷新 — singleton Promise 防止并发多次 refresh
 */
let refreshPromise: Promise<AuthTokens> | null = null;

export async function refreshAccessToken(
  doRefresh: (refreshToken: string) => Promise<AuthTokens>,
): Promise<AuthTokens> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    callbacks.onAuthExpired?.();
    throw new Error('No refresh token available');
  }

  refreshPromise = doRefresh(refreshToken)
    .then((tokens) => {
      setTokens(tokens);
      callbacks.onTokenRefreshed?.(tokens);
      return tokens;
    })
    .catch((err) => {
      clearTokens();
      callbacks.onAuthExpired?.();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
