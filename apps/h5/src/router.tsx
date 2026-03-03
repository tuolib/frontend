import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';

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
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product', element: <ProductList /> },
      { path: 'cart', element: <Cart /> },
      { path: 'me', element: <Profile /> },
    ],
  },
  {
    children: [
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'search', element: <Search /> },
      { path: 'order/create', element: <OrderCreate /> },
      { path: 'order', element: <OrderList /> },
      { path: 'order/:id', element: <OrderDetail /> },
      { path: 'order/:id/pay', element: <OrderPayment /> },
      { path: 'me/address', element: <Address /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
