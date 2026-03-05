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
