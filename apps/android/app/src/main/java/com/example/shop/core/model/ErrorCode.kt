package com.example.shop.core.model

object ErrorCode {
    // User 1xxx
    const val USER_NOT_FOUND = "USER_1001"
    const val USER_ALREADY_EXISTS = "USER_1002"
    const val INVALID_CREDENTIALS = "USER_1003"
    const val TOKEN_EXPIRED = "USER_1004"
    const val TOKEN_REVOKED = "USER_1005"
    const val PASSWORD_TOO_WEAK = "USER_1006"
    const val EMAIL_NOT_VERIFIED = "USER_1007"
    const val ADDRESS_LIMIT = "USER_1008"

    // Product 2xxx
    const val PRODUCT_NOT_FOUND = "PRODUCT_2001"
    const val SKU_NOT_FOUND = "PRODUCT_2002"
    const val STOCK_INSUFFICIENT = "PRODUCT_2003"
    const val CATEGORY_NOT_FOUND = "PRODUCT_2004"
    const val DUPLICATE_SKU_CODE = "PRODUCT_2005"
    const val INVALID_PRICE = "PRODUCT_2006"
    const val PRODUCT_UNAVAILABLE = "PRODUCT_2007"

    // Cart 3xxx
    const val CART_ITEM_NOT_FOUND = "CART_3001"
    const val CART_LIMIT_EXCEEDED = "CART_3002"
    const val CART_SKU_UNAVAILABLE = "CART_3003"
    const val CART_PRICE_CHANGED = "CART_3004"

    // Order 4xxx
    const val ORDER_NOT_FOUND = "ORDER_4001"
    const val ORDER_STATUS_INVALID = "ORDER_4002"
    const val ORDER_EXPIRED = "ORDER_4003"
    const val ORDER_ALREADY_PAID = "ORDER_4004"
    const val ORDER_CANCEL_DENIED = "ORDER_4005"
    const val PAYMENT_FAILED = "ORDER_4006"
    const val IDEMPOTENT_CONFLICT = "ORDER_4007"

    // Gateway 9xxx
    const val RATE_LIMITED = "GATEWAY_9001"
    const val SERVICE_UNAVAILABLE = "GATEWAY_9002"
}
