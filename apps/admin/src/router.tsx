import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';

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
const Login = lazy(() => import('./pages/auth/login'));

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'product', element: <ProductList /> },
      { path: 'product/create', element: <ProductCreate /> },
      { path: 'product/:id/edit', element: <ProductEdit /> },
      { path: 'category', element: <CategoryList /> },
      { path: 'order', element: <OrderList /> },
      { path: 'order/:id', element: <OrderDetail /> },
      { path: 'stock', element: <StockAdjust /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
    ],
  },
]);
