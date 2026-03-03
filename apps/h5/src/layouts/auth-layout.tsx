/**
 * AuthLayout — 登录/注册页面布局
 */

import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
