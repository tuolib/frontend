import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { ErrorBoundary, Spinner } from '@fe/ui';
import RequireAuth from '@/components/require-auth';
import GuestOnly from '@/components/guest-only';

const RootLayout = lazy(() => import('./layouts/root-layout'));
const AuthLayout = lazy(() => import('./layouts/auth-layout'));

const Home = lazy(() => import('./pages/home'));
const Menu = lazy(() => import('./pages/menu'));
const ProductList = lazy(() => import('./pages/product/list'));
const ProductDetail = lazy(() => import('./pages/product/detail'));
const Search = lazy(() => import('./pages/product/search'));
const Cart = lazy(() => import('./pages/cart'));
const OrderCreate = lazy(() => import('./pages/order/create'));
const OrderList = lazy(() => import('./pages/order/list'));
const OrderDetail = lazy(() => import('./pages/order/detail'));
const OrderPayment = lazy(() => import('./pages/order/payment'));
const Profile = lazy(() => import('./pages/user/profile'));
const Address = lazy(() => import('./pages/user/address'));
const Login = lazy(() => import('./pages/auth/login'));
const Register = lazy(() => import('./pages/auth/register'));
const Download = lazy(() => import('./pages/download'));
const NotFound = lazy(() => import('./pages/error/not-found'));
const ScrollToTop = lazy(() => import('./components/scroll-to-top'));

function PageFallback() {
  return (
    <div className="flex-cc min-h-screen">
      <Spinner size="lg" />
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
  {
    element: <ScrollToTop />,
    children: [
      // Tab 页面（RootLayout 包裹，显示底部导航）
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'me', element: <Profile /> },
          { path: 'menu', element: <Menu /> },
        ],
      },
      // 独立公开页面（无底部导航）
      {
        children: [
          { path: 'product', element: <RouteErrorBoundary><ProductList /></RouteErrorBoundary> },
          { path: 'dp/:id', element: <RouteErrorBoundary><ProductDetail /></RouteErrorBoundary> },
          { path: 'search', element: <RouteErrorBoundary><Search /></RouteErrorBoundary> },
          { path: 'download', element: <RouteErrorBoundary><Download /></RouteErrorBoundary> },
        ],
      },
      // 需要登录
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RootLayout />,
            children: [
              { path: 'cart', element: <Cart /> },
            ],
          },
          { path: 'me/address', element: <RouteErrorBoundary><Address /></RouteErrorBoundary> },
          { path: 'order/create', element: <RouteErrorBoundary><OrderCreate /></RouteErrorBoundary> },
          { path: 'order', element: <RouteErrorBoundary><OrderList /></RouteErrorBoundary> },
          { path: 'order/:id', element: <RouteErrorBoundary><OrderDetail /></RouteErrorBoundary> },
          { path: 'order/:id/pay', element: <RouteErrorBoundary><OrderPayment /></RouteErrorBoundary> },
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
              { path: 'register', element: <Register /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
