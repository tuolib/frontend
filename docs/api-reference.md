# Backend API Reference

> Complete endpoint reference for the e-commerce platform backend.
> This document covers all 40 endpoints across Auth, User, Product, Cart, Order, Payment, and Admin domains.

---

## Table of Contents

- [Conventions](#conventions)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Type Definitions](#type-definitions)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [User](#user)
  - [Address](#address)
  - [Product](#product)
  - [Category](#category)
  - [Cart](#cart)
  - [Order](#order)
  - [Payment](#payment)
  - [Admin - Product](#admin---product)
  - [Admin - Category](#admin---category)
  - [Admin - Order](#admin---order)
  - [Admin - Stock](#admin---stock)

---

## Conventions

| Rule | Detail |
|------|--------|
| HTTP Method | **All endpoints use `POST`** |
| Content-Type | `application/json` |
| Auth Header | `Authorization: Bearer <accessToken>` |
| Idempotency Header | `X-Idempotency-Key: <unique-string>` (required for order creation and payment) |
| Route Prefix | Public: `/api/v1/`, Internal: `/internal/` |

---

## Response Format

### Success Response

```typescript
{
  code: 200;
  success: true;
  data: T;
  message: "";
  traceId: string;
}
```

### Error Response

```typescript
{
  code: number;        // HTTP status code
  success: false;
  message: string;     // User-facing message
  data: null;
  meta: {
    code: string;      // Business error code, e.g. "USER_NOT_FOUND"
    message: string;   // Developer-readable description
    details?: unknown; // Optional validation error details
  };
  traceId: string;
}
```

### Paginated Response

When an endpoint returns a paginated list, `data` has the following shape:

```typescript
{
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Error Codes

### User Domain

| Code | Name | Description |
|------|------|-------------|
| `USER_1001` | User Not Found | The requested user does not exist |
| `USER_1002` | Email Exists | The email address is already registered |
| `USER_1003` | Invalid Credentials | Email or password is incorrect |
| `USER_1004` | Token Expired | The access or refresh token has expired |
| `USER_1005` | Token Revoked | The token has been revoked (e.g. after logout) |
| `USER_1006` | Weak Password | The password does not meet strength requirements |
| `USER_1007` | Email Not Verified | The email address has not been verified |
| `USER_1008` | Address Limit | Maximum number of addresses reached |

### Product Domain

| Code | Name | Description |
|------|------|-------------|
| `PRODUCT_2001` | Product Not Found | The requested product does not exist |
| `PRODUCT_2002` | SKU Not Found | The requested SKU does not exist |
| `PRODUCT_2003` | Stock Insufficient | Not enough stock for the requested quantity |
| `PRODUCT_2004` | Category Not Found | The requested category does not exist |
| `PRODUCT_2005` | Duplicate SKU Code | The SKU code already exists |
| `PRODUCT_2006` | Invalid Price | The price value is invalid |
| `PRODUCT_2007` | Product Unavailable | The product is not available for purchase |

### Cart Domain

| Code | Name | Description |
|------|------|-------------|
| `CART_3001` | Item Not Found | The cart item does not exist |
| `CART_3002` | Limit Exceeded | Cart item count limit exceeded |
| `CART_3003` | SKU Unavailable | The SKU is no longer available |
| `CART_3004` | Price Changed | The item price has changed since it was added |

### Order Domain

| Code | Name | Description |
|------|------|-------------|
| `ORDER_4001` | Order Not Found | The requested order does not exist |
| `ORDER_4002` | Invalid Status | The order status does not allow this operation |
| `ORDER_4003` | Order Expired | The unpaid order has expired |
| `ORDER_4004` | Already Paid | The order has already been paid |
| `ORDER_4005` | Cancel Denied | The order cannot be cancelled in its current state |
| `ORDER_4006` | Payment Failed | The payment attempt failed |
| `ORDER_4007` | Idempotent Conflict | Duplicate request with conflicting parameters |

### Gateway Domain

| Code | Name | Description |
|------|------|-------------|
| `GATEWAY_9001` | Rate Limited | Too many requests, try again later |
| `GATEWAY_9002` | Service Unavailable | The upstream service is unavailable |

---

## Type Definitions

### User Types

```typescript
interface UserProfile {
  id: string;
  email: string;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  status: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  id: string;
  userId: string;
  label: string | null;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Product Types

```typescript
interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  status: string;
  minPrice: string | null;
  maxPrice: string | null;
  totalSales: number;
  primaryImage: string | null;
  createdAt: string;
}

interface ProductDetail extends ProductListItem {
  description: string | null;
  attributes: any;
  updatedAt: string;
  images: ProductImage[];
  skus: SkuDTO[];
  categories: CategoryBasic[];
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface SkuDTO {
  id: string;
  skuCode: string;
  price: string;
  comparePrice: string | null;
  stock: number;
  attributes: Record<string, string> | null;
  status: string;
}

interface CategoryBasic {
  id: string;
  name: string;
  slug: string;
}

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  children: CategoryNode[];
}
```

### Cart Types

```typescript
interface CartListItem {
  skuId: string;
  quantity: number;
  selected: boolean;
  addedAt: string;
  snapshot: {
    productId: string;
    productTitle: string;
    skuAttrs: Record<string, string> | null;
    price: string;
    imageUrl: string | null;
  };
  currentPrice: string;
  currentStock: number;
  priceChanged: boolean;
  unavailable: boolean;
  stockInsufficient: boolean;
}

interface CheckoutPreview {
  items: CheckoutItem[];
  summary: {
    itemsTotal: string;
    shippingFee: string;
    discountAmount: string;
    payAmount: string;
  };
  warnings: {
    unavailableItems: unknown[];
    priceChangedItems: unknown[];
    insufficientItems: unknown[];
  };
  canCheckout: boolean;
}
```

### Order Types

```typescript
type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

interface OrderListItem {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
  payAmount: string;
  itemCount: number;
  firstItem: {
    productTitle: string;
    imageUrl: string | null;
    skuAttrs: Record<string, string> | null;
  } | null;
  createdAt: string;
}

interface OrderDetailResult {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
  totalAmount: string;
  discountAmount: string;
  payAmount: string;
  remark: string | null;
  expiresAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  items: OrderItem[];
  address: OrderAddress | null;
}
```

### Payment Types

```typescript
type PaymentMethod = "stripe" | "alipay" | "wechat" | "mock";

interface PaymentRecord {
  paymentId: string;
  method: PaymentMethod;
  amount: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}
```

---

## Endpoints

### Auth

#### 1. Register

Creates a new user account and returns authentication tokens.

```
POST /api/v1/auth/register
```

**Auth:** None

**Request Body:**

```typescript
{
  email: string;       // Valid email format
  password: string;    // Min 8, max 100 characters
  nickname?: string;   // Max 50 characters
}
```

**Response Data:**

```typescript
{
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}
```

**Errors:** `USER_1002` (email exists), `USER_1006` (weak password)

---

#### 2. Login

Authenticates a user and returns tokens.

```
POST /api/v1/auth/login
```

**Auth:** None

**Request Body:**

```typescript
{
  email: string;       // Valid email format
  password: string;    // Min 1 character
}
```

**Response Data:**

```typescript
{
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}
```

**Errors:** `USER_1003` (invalid credentials), `USER_1007` (email not verified)

---

#### 3. Refresh Token

Exchanges a refresh token for a new token pair.

```
POST /api/v1/auth/refresh
```

**Auth:** None

**Request Body:**

```typescript
{
  refreshToken: string;
}
```

**Response Data:**

```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Errors:** `USER_1004` (token expired), `USER_1005` (token revoked)

---

#### 4. Logout

Invalidates the current session. Optionally revokes the refresh token.

```
POST /api/v1/auth/logout
```

**Auth:** Required

**Request Body:**

```typescript
{
  refreshToken?: string;
}
```

**Response Data:** `null`

---

### User

#### 5. Get Profile

Returns the authenticated user's profile.

```
POST /api/v1/user/profile
```

**Auth:** Required

**Request Body:**

```typescript
{}
```

**Response Data:** `UserProfile`

**Errors:** `USER_1001` (not found)

---

#### 6. Update Profile

Updates the authenticated user's profile fields.

```
POST /api/v1/user/update
```

**Auth:** Required

**Request Body:**

```typescript
{
  nickname?: string;   // Max 50 characters
  avatarUrl?: string;  // Valid URL
  phone?: string;      // Max 20 characters
}
```

**Response Data:** `UserProfile`

---

### Address

#### 7. List Addresses

Returns all addresses for the authenticated user.

```
POST /api/v1/user/address/list
```

**Auth:** Required

**Request Body:**

```typescript
{}
```

**Response Data:** `Address[]`

---

#### 8. Create Address

Adds a new shipping address.

```
POST /api/v1/user/address/create
```

**Auth:** Required

**Request Body:**

```typescript
{
  label?: string;      // Max 50 characters (e.g. "Home", "Office")
  recipient: string;   // Max 100 characters
  phone: string;       // Max 20 characters
  province: string;    // Max 50 characters
  city: string;        // Max 50 characters
  district: string;    // Max 50 characters
  address: string;     // Full street address
  postalCode?: string; // Max 10 characters
  isDefault?: boolean;
}
```

**Response Data:** `Address`

**Errors:** `USER_1008` (address limit)

---

#### 9. Update Address

Updates an existing address.

```
POST /api/v1/user/address/update
```

**Auth:** Required

**Request Body:**

```typescript
{
  id: string;          // Address ID (required)
  label?: string;      // Max 50 characters
  recipient?: string;  // Max 100 characters
  phone?: string;      // Max 20 characters
  province?: string;   // Max 50 characters
  city?: string;       // Max 50 characters
  district?: string;   // Max 50 characters
  address?: string;
  postalCode?: string; // Max 10 characters
  isDefault?: boolean;
}
```

**Response Data:** `Address`

---

#### 10. Delete Address

Deletes an address by ID.

```
POST /api/v1/user/address/delete
```

**Auth:** Required

**Request Body:**

```typescript
{
  id: string;
}
```

**Response Data:** `null`

---

### Product

#### 11. List Products

Returns a paginated list of products with optional filtering and sorting.

```
POST /api/v1/product/list
```

**Auth:** None

**Request Body:**

```typescript
{
  page?: number;          // Default: 1
  pageSize?: number;      // Default: 20, max: 100
  sort?: "createdAt" | "price" | "sales";
  order?: "asc" | "desc";
  filters?: {
    status?: string;
    categoryId?: string;
    brand?: string;
  };
}
```

**Response Data:** `Paginated<ProductListItem>`

---

#### 12. Product Detail

Returns full details for a single product including images, SKUs, and categories.

```
POST /api/v1/product/detail
```

**Auth:** None

**Request Body:**

```typescript
{
  id: string;
}
```

**Response Data:** `ProductDetail`

**Errors:** `PRODUCT_2001` (not found)

---

#### 13. Search Products

Full-text search across products with filtering and sorting options.

```
POST /api/v1/product/search
```

**Auth:** None

**Request Body:**

```typescript
{
  keyword: string;        // Max 200 characters
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "sales" | "newest";
  page?: number;
  pageSize?: number;
}
```

**Response Data:** `Paginated<ProductListItem>`

---

#### 14. List SKUs

Returns all SKUs for a given product.

```
POST /api/v1/product/sku/list
```

**Auth:** None

**Request Body:**

```typescript
{
  productId: string;
}
```

**Response Data:** `SkuDTO[]`

**Errors:** `PRODUCT_2001` (product not found)

---

### Category

#### 15. List Categories

Returns a flat list of all categories.

```
POST /api/v1/category/list
```

**Auth:** None

**Request Body:**

```typescript
{}
```

**Response Data:** `CategoryNode[]`

---

#### 16. Category Tree

Returns categories as a nested tree structure.

```
POST /api/v1/category/tree
```

**Auth:** None

**Request Body:**

```typescript
{}
```

**Response Data:** `CategoryNode[]`

---

#### 17. Category Detail

Returns a single category by ID.

```
POST /api/v1/category/detail
```

**Auth:** None

**Request Body:**

```typescript
{
  id: string;
}
```

**Response Data:** `CategoryNode`

**Errors:** `PRODUCT_2004` (category not found)

---

### Cart

#### 18. Add to Cart

Adds an item to the cart or increments quantity if already present.

```
POST /api/v1/cart/add
```

**Auth:** Required

**Request Body:**

```typescript
{
  skuId: string;
  quantity: number;   // Range: 1-99
}
```

**Response Data:** `null`

**Errors:** `PRODUCT_2002` (SKU not found), `CART_3002` (limit exceeded), `CART_3003` (SKU unavailable)

---

#### 19. List Cart Items

Returns all items in the authenticated user's cart with current price/stock status.

```
POST /api/v1/cart/list
```

**Auth:** Required

**Request Body:**

```typescript
{}
```

**Response Data:** `CartListItem[]`

---

#### 20. Update Cart Item

Updates the quantity of a cart item. Set quantity to 0 to remove.

```
POST /api/v1/cart/update
```

**Auth:** Required

**Request Body:**

```typescript
{
  skuId: string;
  quantity: number;   // Range: 0-99 (0 removes the item)
}
```

**Response Data:** `null`

**Errors:** `CART_3001` (item not found)

---

#### 21. Remove Cart Items

Removes one or more items from the cart by SKU IDs.

```
POST /api/v1/cart/remove
```

**Auth:** Required

**Request Body:**

```typescript
{
  skuIds: string[];
}
```

**Response Data:** `null`

---

#### 22. Clear Cart

Removes all items from the cart.

```
POST /api/v1/cart/clear
```

**Auth:** Required

**Request Body:**

```typescript
{}
```

**Response Data:** `null`

---

#### 23. Select Cart Items

Toggles the selected state of items for checkout.

```
POST /api/v1/cart/select
```

**Auth:** Required

**Request Body:**

```typescript
{
  skuIds: string[];
  selected: boolean;
}
```

**Response Data:** `null`

---

#### 24. Checkout Preview

Returns a preview of the checkout with pricing, warnings, and availability checks.

```
POST /api/v1/cart/checkout/preview
```

**Auth:** Required

**Request Body:**

```typescript
{}
```

**Response Data:** `CheckoutPreview`

---

### Order

#### 25. Create Order

Creates a new order from the specified items. Requires idempotency key.

```
POST /api/v1/order/create
```

**Auth:** Required
**Headers:** `X-Idempotency-Key: <unique-string>` (required)

**Request Body:**

```typescript
{
  items: Array<{
    skuId: string;
    quantity: number;
  }>;
  addressId: string;
  remark?: string;     // Max 500 characters
}
```

**Response Data:**

```typescript
{
  orderId: string;
  orderNo: string;
  payAmount: string;
  expiresAt: string;
}
```

**Errors:** `PRODUCT_2003` (stock insufficient), `ORDER_4007` (idempotent conflict)

---

#### 26. List Orders

Returns a paginated list of the authenticated user's orders.

```
POST /api/v1/order/list
```

**Auth:** Required

**Request Body:**

```typescript
{
  page?: number;
  pageSize?: number;     // Max: 50
  status?: OrderStatus;
}
```

**Response Data:** `Paginated<OrderListItem>`

---

#### 27. Order Detail

Returns full details for a single order.

```
POST /api/v1/order/detail
```

**Auth:** Required

**Request Body:**

```typescript
{
  orderId: string;
}
```

**Response Data:** `OrderDetailResult`

**Errors:** `ORDER_4001` (not found)

---

#### 28. Cancel Order

Cancels an unpaid order.

```
POST /api/v1/order/cancel
```

**Auth:** Required

**Request Body:**

```typescript
{
  orderId: string;
  reason?: string;     // Max 500 characters
}
```

**Response Data:** `null`

**Errors:** `ORDER_4001` (not found), `ORDER_4005` (cancel denied)

---

### Payment

#### 29. Create Payment

Initiates a payment for an order. Requires idempotency key.

```
POST /api/v1/payment/create
```

**Auth:** Required
**Headers:** `X-Idempotency-Key: <unique-string>` (required)

**Request Body:**

```typescript
{
  orderId: string;
  method: "stripe" | "alipay" | "wechat" | "mock";
}
```

**Response Data:**

```typescript
{
  paymentId: string;
  method: PaymentMethod;
  amount: string;
  payUrl: string;
}
```

**Errors:** `ORDER_4001` (not found), `ORDER_4003` (expired), `ORDER_4004` (already paid), `ORDER_4006` (payment failed)

---

#### 30. Query Payment

Returns the payment status and history for an order.

```
POST /api/v1/payment/query
```

**Auth:** Required

**Request Body:**

```typescript
{
  orderId: string;
}
```

**Response Data:**

```typescript
{
  orderId: string;
  orderStatus: OrderStatus;
  payments: PaymentRecord[];
}
```

**Errors:** `ORDER_4001` (not found)

---

### Admin - Product

#### 31. Create Product

Creates a new product with images and category assignments.

```
POST /api/v1/admin/product/create
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  title: string;
  slug?: string;
  description?: string;
  brand?: string;
  status?: string;
  attributes?: any;
  categoryIds: string[];
  images?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
}
```

**Response Data:** `ProductDetail`

---

#### 32. Update Product

Updates an existing product's fields.

```
POST /api/v1/admin/product/update
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  brand?: string;
  status?: string;
  attributes?: any;
  categoryIds?: string[];
  images?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
}
```

**Response Data:** `ProductDetail`

**Errors:** `PRODUCT_2001` (not found)

---

#### 33. Delete Product

Soft-deletes a product.

```
POST /api/v1/admin/product/delete
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  id: string;
}
```

**Response Data:** `null`

**Errors:** `PRODUCT_2001` (not found)

---

#### 34. Create SKU

Creates a new SKU for a product.

```
POST /api/v1/admin/product/sku/create
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  productId: string;
  skuCode: string;
  price: string;           // Decimal as string
  comparePrice?: string;
  costPrice?: string;
  stock?: number;
  lowStock?: number;
  weight?: number;
  attributes: Record<string, string>;
  barcode?: string;
}
```

**Response Data:** `SkuDTO`

**Errors:** `PRODUCT_2001` (product not found), `PRODUCT_2005` (duplicate SKU code), `PRODUCT_2006` (invalid price)

---

#### 35. Update SKU

Updates an existing SKU's fields.

```
POST /api/v1/admin/product/sku/update
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  skuId: string;
  price?: string;
  comparePrice?: string;
  costPrice?: string;
  lowStock?: number;
  weight?: number;
  attributes?: Record<string, string>;
  barcode?: string;
  status?: string;
}
```

**Response Data:** `SkuDTO`

**Errors:** `PRODUCT_2002` (SKU not found), `PRODUCT_2006` (invalid price)

---

### Admin - Category

#### 36. Create Category

Creates a new product category.

```
POST /api/v1/admin/category/create
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  name: string;
  slug?: string;
  parentId?: string;
  iconUrl?: string;
  sortOrder?: number;
}
```

**Response Data:** `CategoryNode`

---

#### 37. Update Category

Updates an existing category.

```
POST /api/v1/admin/category/update
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  id: string;
  name?: string;
  slug?: string;
  parentId?: string;
  iconUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}
```

**Response Data:** `CategoryNode`

**Errors:** `PRODUCT_2004` (category not found)

---

### Admin - Order

#### 38. List All Orders

Returns a paginated list of all orders (admin view).

```
POST /api/v1/admin/order/list
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}
```

**Response Data:** `Paginated<OrderListItem>`

---

#### 39. Ship Order

Marks an order as shipped with optional tracking number.

```
POST /api/v1/admin/order/ship
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  orderId: string;
  trackingNo?: string;
}
```

**Response Data:** `null`

**Errors:** `ORDER_4001` (not found), `ORDER_4002` (invalid status)

---

### Admin - Stock

#### 40. Adjust Stock

Sets the absolute stock level for a SKU. This is an administrative override.

```
POST /api/v1/admin/stock/adjust
```

**Auth:** Required (admin)

**Request Body:**

```typescript
{
  skuId: string;
  quantity: number;    // Min: 0
  reason?: string;
}
```

**Response Data:** `null`

**Errors:** `PRODUCT_2002` (SKU not found)
