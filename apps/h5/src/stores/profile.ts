import { create } from 'zustand';
import { order } from '@fe/api-client';
import type { OrderListItem } from '@fe/shared';

interface ProfileState {
  recentOrders: OrderListItem[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  recentOrders: [],
  loaded: false,
  loading: false,

  async fetch() {
    if (get().loading) return;
    set({ loading: true });

    try {
      const res = await order.list({ page: 1, pageSize: 3 });
      set({ recentOrders: res.items, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  clear() {
    set({ recentOrders: [], loaded: false });
  },
}));
