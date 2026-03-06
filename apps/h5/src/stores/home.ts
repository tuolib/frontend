import { create } from 'zustand';
import { product, banner as bannerApi } from '@fe/api-client';
import type { ProductListItem, BannerItem } from '@fe/shared';

interface HomeState {
  banners: BannerItem[];
  dealItems: ProductListItem[];
  newArrivalItems: ProductListItem[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  banners: [],
  dealItems: [],
  newArrivalItems: [],
  loaded: false,
  loading: false,

  async fetch() {
    if (get().loading) return;
    set({ loading: true });

    try {
      const [bannerList, deals, newArrivals] = await Promise.all([
        bannerApi.list(),
        product.list({ page: 1, pageSize: 10, sort: 'sales', order: 'desc' }),
        product.list({ page: 1, pageSize: 8, sort: 'createdAt', order: 'desc' }),
      ]);

      set({
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
