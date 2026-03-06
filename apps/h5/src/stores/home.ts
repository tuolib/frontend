import { create } from 'zustand';
import { product, category, banner as bannerApi } from '@fe/api-client';
import type { ProductListItem, BannerItem, CategoryNode } from '@fe/shared';

interface HomeState {
  categories: CategoryNode[];
  banners: BannerItem[];
  dealItems: ProductListItem[];
  newArrivalItems: ProductListItem[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  categories: [],
  banners: [],
  dealItems: [],
  newArrivalItems: [],
  loaded: false,
  loading: false,

  async fetch() {
    if (get().loading) return;
    set({ loading: true });

    try {
      const [cats, bannerList, deals, newArrivals] = await Promise.all([
        category.tree(),
        bannerApi.list(),
        product.list({ page: 1, pageSize: 10, sort: 'sales', order: 'desc' }),
        product.list({ page: 1, pageSize: 8, sort: 'createdAt', order: 'desc' }),
      ]);

      set({
        categories: cats,
        banners: bannerList,
        dealItems: deals.items,
        newArrivalItems: newArrivals.items,
        loaded: true,
      });
    } finally {
      set({ loading: false });
    }
  },
}));
