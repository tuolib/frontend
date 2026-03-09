import { create } from 'zustand';
import { cart } from '@fe/api-client';
import type { CartListItem } from '@fe/shared';

interface CartState {
  items: CartListItem[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  reload: () => Promise<void>;
  mutate: (updater: CartListItem[] | ((prev: CartListItem[]) => CartListItem[])) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loaded: false,
  loading: false,

  async fetch() {
    if (get().loading) return;
    set({ loading: true });

    try {
      const items = await cart.list();
      set({ items, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  async reload() {
    try {
      const items = await cart.list();
      set({ items, loaded: true });
    } catch {
      // silently fail, keep current data
    }
  },

  mutate(updater) {
    set((s) => ({
      items: typeof updater === 'function' ? updater(s.items) : updater,
    }));
  },

  clear() {
    set({ items: [], loaded: false });
  },
}));
