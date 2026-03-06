/**
 * AuthLayout — Amazon 风格登录/注册页面布局
 */

import { Outlet } from 'react-router';
import '@/styles/auth.scss';

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-logo">
        <span className="i-carbon-shopping-bag w-40 h-40 text-[#ff9900]" />
        <span className="text-26 font-700 text-white tracking-[0.04em]">
          Shop<span className="text-[#ff9900]">Mall</span>
        </span>
      </div>

      <Outlet />

      <div className="auth-footer">© 2026 ShopMall</div>
    </div>
  );
}
