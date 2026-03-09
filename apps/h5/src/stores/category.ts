import { create } from 'zustand';
import { category } from '@fe/api-client';
import type { CategoryNode } from '@fe/shared';

interface CategoryState {
  categories: CategoryNode[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loaded: false,
  loading: false,

  async fetch() {
    if (get().loading) return;
    set({ loading: true });

    try {
      const cats = await category.tree();
      set({ categories: cats, loaded: true });
    } finally {
      set({ loading: false });
    }
  },
}));
