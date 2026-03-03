/**
 * 订单相关类型 — 镜像后端 CreateOrderResult / OrderListItem / OrderDetailResult
 */

export interface CreateOrderResult {
  orderId: string;
  orderNo: string;
  payAmount: string;
  expiresAt: string;
}

export interface OrderListItem {
  orderId: string;
  orderNo: string;
  status: string;
  payAmount: string;
  itemCount: number;
  firstItem: {
    productTitle: string;
    imageUrl: string | null;
    skuAttrs: unknown;
  } | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  skuId: string;
  productTitle: string;
  skuAttrs: unknown;
  imageUrl: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface OrderAddress {
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string | null;
}

export interface OrderDetailResult {
  orderId: string;
  orderNo: string;
  status: string;
  totalAmount: string;
  discountAmount: string;
  payAmount: string;
  remark: string | null;
  expiresAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  items: OrderItem[];
  address: OrderAddress | null;
}
