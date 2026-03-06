import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { ErrorBoundary } from '@fe/ui';
import RequireAuth from '@/components/require-auth';
import GuestOnly from '@/components/guest-only';

const AdminLayout = lazy(() => import('./layouts/admin-layout'));
const AuthLayout = lazy(() => import('./layouts/auth-layout'));

const Dashboard = lazy(() => import('./pages/dashboard'));
const ProductList = lazy(() => import('./pages/product/list'));
const ProductCreate = lazy(() => import('./pages/product/create'));
const ProductEdit = lazy(() => import('./pages/product/edit'));
const CategoryList = lazy(() => import('./pages/category/list'));
const OrderList = lazy(() => import('./pages/order/list'));
const OrderDetail = lazy(() => import('./pages/order/detail'));
const StockAdjust = lazy(() => import('./pages/stock/adjust'));
const UserList = lazy(() => import('./pages/user/list'));
const UserDetail = lazy(() => import('./pages/user/detail'));
const StaffList = lazy(() => import('./pages/staff/list'));
const Login = lazy(() => import('./pages/auth/login'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-60">
      <Spin size="large" />
    </div>
  );
}

function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  // 需要登录
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <RouteErrorBoundary><Dashboard /></RouteErrorBoundary> },
          { path: 'product', element: <RouteErrorBoundary><ProductList /></RouteErrorBoundary> },
          { path: 'product/create', element: <RouteErrorBoundary><ProductCreate /></RouteErrorBoundary> },
          { path: 'product/:id/edit', element: <RouteErrorBoundary><ProductEdit /></RouteErrorBoundary> },
          { path: 'category', element: <RouteErrorBoundary><CategoryList /></RouteErrorBoundary> },
          { path: 'order', element: <RouteErrorBoundary><OrderList /></RouteErrorBoundary> },
          { path: 'order/:id', element: <RouteErrorBoundary><OrderDetail /></RouteErrorBoundary> },
          { path: 'stock', element: <RouteErrorBoundary><StockAdjust /></RouteErrorBoundary> },
          { path: 'user', element: <RouteErrorBoundary><UserList /></RouteErrorBoundary> },
          { path: 'user/:id', element: <RouteErrorBoundary><UserDetail /></RouteErrorBoundary> },
          { path: 'staff', element: <RouteErrorBoundary><StaffList /></RouteErrorBoundary> },
        ],
      },
    ],
  },
  // 仅游客
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <Login /> },
        ],
      },
    ],
  },
]);
