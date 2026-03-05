/**
 * 认证域 API
 */

import { post } from '../client';
import { setTokens, getRefreshToken } from '../auth-manager';
import type { AuthResult, TokenPair } from '@fe/shared';

export const auth = {
  async register(input: {
    email: string;
    password: string;
    nickname?: string;
  }): Promise<AuthResult> {
    const result = await post<AuthResult>('/v1/auth/register', {
      ...input,
      confirmPassword: input.password,
    });
    setTokens(result);
    return result;
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const result = await post<AuthResult>('/v1/auth/login', input);
    setTokens(result);
    return result;
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    await post<null>('/v1/auth/logout', { refreshToken });
    // token 清理由调用方（useAuthStore）统一处理
  },

  async refresh(): Promise<TokenPair> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const result = await post<TokenPair>('/v1/auth/refresh', { refreshToken });
    setTokens(result);
    return result;
  },
};
