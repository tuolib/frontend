// ── client ──
export { httpClient, post, postPaginated, setBaseUrl } from './client';

// ── errors ──
export { ApiError } from './errors';
export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from './types';

// ── auth manager ──
export {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  setAuthCallbacks,
  type AuthTokens,
  type AuthCallbacks,
} from './auth-manager';

// ── idempotency ──
export { generateIdempotencyKey } from './idempotency';

// ── domain APIs ──
export { auth } from './domains/auth';
export { user } from './domains/user';
export { address } from './domains/address';
export { product } from './domains/product';
export { category } from './domains/category';
export { cart } from './domains/cart';
export { order } from './domains/order';
export { payment } from './domains/payment';

// ── admin APIs ──
export {
  adminProduct,
  adminCategory,
  adminOrder,
  adminStock,
} from './domains/admin';
