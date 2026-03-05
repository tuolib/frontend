import { Navigate, Outlet, useLocation } from 'react-router';
import { useAdminAuthStore } from '@/stores/admin-auth';

export default function GuestOnly() {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
