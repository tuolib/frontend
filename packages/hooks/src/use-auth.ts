/**
 * Auth Store — Zustand 认证状态管理
 */

import { create } from 'zustand';
import type { UserProfile } from '@fe/shared';
import {
  auth as authApi,
  user as userApi,
  getAccessToken,
  setAuthCallbacks,
  clearTokens,
} from '@fe/api-client';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const result = await authApi.login({ email, password });
    set({ user: result.user, isAuthenticated: true });
  },

  register: async (email, password, nickname) => {
    const result = await authApi.register({ email, password, nickname });
    set({ user: result.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // 即使 API 失败也清除本地状态
    }
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    const profile = await userApi.profile();
    set({ user: profile, isAuthenticated: true });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  initialize: () => {
    const token = getAccessToken();
    if (token) {
      set({ isAuthenticated: true, isLoading: false });
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }

    setAuthCallbacks({
      onAuthExpired: () => {
        set({ user: null, isAuthenticated: false });
      },
    });
  },
}));
