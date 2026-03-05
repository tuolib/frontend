/**
 * Admin 认证域 API — 独立于 C 端，无 refresh token
 */

import { post } from '../client';
import type { AdminProfile, AdminLoginResult } from '@fe/shared';

export const adminAuth = {
  async login(input: { username: string; password: string }): Promise<AdminLoginResult> {
    return post<AdminLoginResult>('/v1/admin/auth/login', input);
  },

  async changePassword(input: { oldPassword: string; newPassword: string }): Promise<null> {
    return post<null>('/v1/admin/auth/change-password', input);
  },

  async profile(): Promise<AdminProfile> {
    return post<AdminProfile>('/v1/admin/auth/profile', {});
  },
};
