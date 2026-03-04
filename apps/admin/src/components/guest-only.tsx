import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@fe/hooks';

export default function GuestOnly() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
