/**
 * 认证域 API
 */

import { post } from '../client';
import { setTokens, clearTokens, getRefreshToken } from '../auth-manager';
import type { AuthResult, TokenPair } from '@fe/shared';

export const auth = {
  async register(input: {
    email: string;
    password: string;
    nickname?: string;
  }): Promise<AuthResult> {
    const result = await post<AuthResult>('api/v1/auth/register', {
      ...input,
      confirmPassword: input.password,
    });
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    return result;
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const result = await post<AuthResult>('api/v1/auth/login', input);
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    return result;
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    await post<null>('api/v1/auth/logout', { refreshToken });
    clearTokens();
  },

  async refresh(): Promise<TokenPair> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const result = await post<TokenPair>('api/v1/auth/refresh', { refreshToken });
    setTokens(result);
    return result;
  },
};
