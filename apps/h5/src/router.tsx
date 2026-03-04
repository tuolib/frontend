import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';
import RequireAuth from '@/components/require-auth';
import GuestOnly from '@/components/guest-only';

const RootLayout = lazy(() => import('./layouts/root-layout'));
const AuthLayout = lazy(() => import('./layouts/auth-layout'));

const Home = lazy(() => import('./pages/home'));
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
const NotFound = lazy(() => import('./pages/error/not-found'));

export const router = createBrowserRouter([
  // 公开路由
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product', element: <ProductList /> },
      { path: 'me', element: <Profile /> },
    ],
  },
  {
    children: [
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'search', element: <Search /> },
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
      { path: 'me/address', element: <Address /> },
      { path: 'order/create', element: <OrderCreate /> },
      { path: 'order', element: <OrderList /> },
      { path: 'order/:id', element: <OrderDetail /> },
      { path: 'order/:id/pay', element: <OrderPayment /> },
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
]);
