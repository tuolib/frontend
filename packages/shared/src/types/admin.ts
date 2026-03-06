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
