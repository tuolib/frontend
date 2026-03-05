/**
 * Admin Auth Store — 独立于 C 端，无 refresh token，2 小时过期后重新登录
 */

import { create } from 'zustand';
import type { AdminProfile } from '@fe/shared';
import { getStorageItem, setStorageItem, removeStorageItem } from '@fe/shared';
import { adminAuth, setAuthCallbacks } from '@fe/api-client';

const ACCESS_TOKEN_KEY = 'access_token';

interface AdminAuthState {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;

  login: (username: string, password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  mustChangePassword: false,

  login: async (username, password) => {
    const result = await adminAuth.login({ username, password });
    setStorageItem(ACCESS_TOKEN_KEY, result.accessToken);
    set({
      admin: result.admin,
      isAuthenticated: true,
      mustChangePassword: result.mustChangePassword,
    });
  },

  changePassword: async (oldPassword, newPassword) => {
    await adminAuth.changePassword({ oldPassword, newPassword });
    set({ mustChangePassword: false });
  },

  logout: () => {
    removeStorageItem(ACCESS_TOKEN_KEY);
    set({ admin: null, isAuthenticated: false, mustChangePassword: false });
  },

  initialize: () => {
    const token = getStorageItem<string>(ACCESS_TOKEN_KEY);
    if (token) {
      set({ isAuthenticated: true, isLoading: false });
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }

    setAuthCallbacks({
      onAuthExpired: () => {
        removeStorageItem(ACCESS_TOKEN_KEY);
        set({ admin: null, isAuthenticated: false });
      },
    });
  },
}));
