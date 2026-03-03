/**
 * 地址相关类型 — 镜像后端 UserAddress
 */

export interface UserAddress {
  id: string;
  userId: string;
  label: string | null;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
