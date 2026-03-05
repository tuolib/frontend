import { Navigate, Outlet, useLocation } from 'react-router';
import { Spin } from 'antd';
import { useAdminAuthStore } from '@/stores/admin-auth';

export default function RequireAuth() {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isLoading = useAdminAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-cc min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
