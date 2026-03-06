/**
 * Admin 后台管理员相关类型
 */

export interface AdminProfile {
  id: string;
  username: string;
  realName: string | null;
  role: 'admin' | 'operator' | 'viewer';
  isSuper: boolean;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminLoginResult {
  admin: AdminProfile;
  accessToken: string;
  mustChangePassword: boolean;
}

export interface StaffListItem {
  id: string;
  username: string;
  realName: string | null;
  role: 'admin' | 'operator' | 'viewer';
  isSuper: boolean;
  status: 'active' | 'disabled';
  phone: string | null;
  email: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminOrderDetailUser {
  id: string;
  email: string;
  nickname: string | null;
  phone: string | null;
  status: string;
}

export interface AdminOrderDetailPayment {
  id: string;
  method: string;
  amount: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
}

export interface AdminOrderDetail {
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
  userId: string;
  user: AdminOrderDetailUser | null;
  items: Array<{
    id: string;
    productId: string;
    skuId: string;
    productTitle: string;
    skuAttrs: Record<string, string>;
    imageUrl: string | null;
    unitPrice: string;
    quantity: number;
    subtotal: string;
  }>;
  address: {
    recipient: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    postalCode: string | null;
  } | null;
  payments: AdminOrderDetailPayment[];
}

export interface AdminUserListItem {
  id: string;
  email: string;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  status: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserAddress {
  id: string;
  label: string | null;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string | null;
  isDefault: boolean;
}

export interface AdminUserOrderStats {
  totalOrders: number;
  totalPaid: number;
  totalAmount: string;
}

export interface AdminUserDetail {
  user: AdminUserListItem;
  addresses: AdminUserAddress[];
  orderStats: AdminUserOrderStats;
}
