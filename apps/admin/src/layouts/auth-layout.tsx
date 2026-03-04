import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-448px p-8 bg-white rounded-12 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <Outlet />
      </div>
    </div>
  );
}
