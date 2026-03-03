/**
 * H5 路由路径常量
 */
export const ROUTES = {
  HOME: '/',
  PRODUCT_LIST: '/product',
  PRODUCT_DETAIL: '/product/:id',
  SEARCH: '/search',
  CART: '/cart',
  ORDER_CREATE: '/order/create',
  ORDER_LIST: '/order',
  ORDER_DETAIL: '/order/:id',
  ORDER_PAY: '/order/:id/pay',
  PROFILE: '/me',
  ADDRESS: '/me/address',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

/**
 * Admin 路由路径常量
 */
export const ADMIN_ROUTES = {
  DASHBOARD: '/',
  PRODUCT_LIST: '/product',
  PRODUCT_CREATE: '/product/create',
  PRODUCT_EDIT: '/product/:id/edit',
  CATEGORY: '/category',
  ORDER_LIST: '/order',
  ORDER_DETAIL: '/order/:id',
  STOCK: '/stock',
  LOGIN: '/login',
} as const;
