/**
 * Token 管理 — 存取 + 刷新去重 + 过期前主动刷新
 */

import { getStorageItem, setStorageItem, removeStorageItem } from '@fe/shared';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'access_token_expires_at';
const REFRESH_TOKEN_EXPIRES_AT_KEY = 'refresh_token_expires_at';

/** 提前刷新的缓冲时间（毫秒）：过期前 60 秒触发 */
const REFRESH_BUFFER_MS = 60_000;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface AuthCallbacks {
  onTokenRefreshed?: (tokens: AuthTokens) => void;
  onAuthExpired?: () => void;
}

let callbacks: AuthCallbacks = {};
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let proactiveRefreshFn: ((refreshToken: string) => Promise<AuthTokens>) | null = null;

export function setAuthCallbacks(cb: AuthCallbacks): void {
  callbacks = cb;
}

export function getAccessToken(): string | null {
  return getStorageItem<string>(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getStorageItem<string>(REFRESH_TOKEN_KEY);
}

export function getAccessTokenExpiresAt(): number | null {
  const v = getStorageItem<string>(ACCESS_TOKEN_EXPIRES_AT_KEY);
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

export function getRefreshTokenExpiresAt(): number | null {
  const v = getStorageItem<string>(REFRESH_TOKEN_EXPIRES_AT_KEY);
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

/** accessToken 是否即将过期（5 秒内）或已过期 */
export function isAccessTokenExpiringSoon(): boolean {
  const expiresAt = getAccessTokenExpiresAt();
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - 5_000;
}

export function setTokens(tokens: AuthTokens): void {
  setStorageItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  setStorageItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  setStorageItem(ACCESS_TOKEN_EXPIRES_AT_KEY, tokens.accessTokenExpiresAt);
  setStorageItem(REFRESH_TOKEN_EXPIRES_AT_KEY, tokens.refreshTokenExpiresAt);
  scheduleProactiveRefresh(tokens.accessTokenExpiresAt);
}

export function clearTokens(): void {
  removeStorageItem(ACCESS_TOKEN_KEY);
  removeStorageItem(REFRESH_TOKEN_KEY);
  removeStorageItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  removeStorageItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
  clearRefreshTimer();
}

/**
 * 注册主动刷新用的 refresh 函数（由 client.ts 调用）
 */
export function setProactiveRefreshFn(fn: (refreshToken: string) => Promise<AuthTokens>): void {
  proactiveRefreshFn = fn;
}

/**
 * 初始化主动刷新定时器（应用启动时调用，基于已存储的过期时间）
 */
export function initProactiveRefresh(): void {
  const expiresAt = getStorageItem<string>(ACCESS_TOKEN_EXPIRES_AT_KEY);
  if (expiresAt && getRefreshToken()) {
    scheduleProactiveRefresh(expiresAt);
  }
}

// ── 定时器管理 ──

function clearRefreshTimer(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleProactiveRefresh(accessTokenExpiresAt: string): void {
  clearRefreshTimer();

  const expiresAtMs = new Date(accessTokenExpiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return;

  const delay = expiresAtMs - Date.now() - REFRESH_BUFFER_MS;

  if (delay <= 0) {
    // 已经在缓冲期内，立即刷新
    doProactiveRefresh();
    return;
  }

  refreshTimer = setTimeout(doProactiveRefresh, delay);
}

async function doProactiveRefresh(): Promise<void> {
  if (!proactiveRefreshFn) return;

  try {
    await refreshAccessToken(proactiveRefreshFn);
  } catch {
    // 刷新失败，401 拦截器或 onAuthExpired 回调会兜底处理
  }
}

// ── Token 刷新 — singleton Promise 防止并发多次 refresh ──

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

/**
 * 如果 token 即将过期，等待刷新完成后返回新 token。
 * 用于 beforeRequest hook，确保请求携带有效 token。
 */
export async function ensureFreshToken(): Promise<string | null> {
  if (!isAccessTokenExpiringSoon()) {
    return getAccessToken();
  }

  // token 即将过期，触发刷新
  if (proactiveRefreshFn && getRefreshToken()) {
    try {
      const tokens = await refreshAccessToken(proactiveRefreshFn);
      return tokens.accessToken;
    } catch {
      return null;
    }
  }

  return getAccessToken();
}
