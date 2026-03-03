/**
 * 购物车相关类型 — 镜像后端 CartListItem / CheckoutPreview
 */

export interface CartSnapshot {
  productId: string;
  productTitle: string;
  skuAttrs: Record<string, string> | null;
  price: string;
  imageUrl: string | null;
}

export interface CartListItem {
  skuId: string;
  quantity: number;
  selected: boolean;
  addedAt: string;
  snapshot: CartSnapshot;
  currentPrice: string;
  currentStock: number;
  priceChanged: boolean;
  unavailable: boolean;
  stockInsufficient: boolean;
}

export interface CheckoutItem {
  skuId: string;
  quantity: number;
  currentPrice: string;
  currentStock: number;
  productId: string;
  productTitle: string;
  skuAttrs: Record<string, string> | null;
  imageUrl: string | null;
}

export interface CheckoutSummary {
  itemsTotal: string;
  shippingFee: string;
  discountAmount: string;
  payAmount: string;
}

export interface CheckoutWarnings {
  unavailableItems: Array<{ skuId: string; productTitle: string }>;
  priceChangedItems: Array<{
    skuId: string;
    productTitle: string;
    oldPrice: string;
    newPrice: string;
  }>;
  insufficientItems: Array<{
    skuId: string;
    productTitle: string;
    requested: number;
    available: number;
  }>;
}

export interface CheckoutPreview {
  items: CheckoutItem[];
  summary: CheckoutSummary;
  warnings: CheckoutWarnings;
  canCheckout: boolean;
}
