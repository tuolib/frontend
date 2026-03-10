package com.example.shop.core.network

import com.example.shop.core.model.ApiResponse

/**
 * Unwrap ApiResponse: return data on success, throw ApiError on failure.
 */
fun <T> ApiResponse<T>.unwrap(): T {
    if (!success || data == null) {
        throw ApiError(
            code = code,
            errorCode = meta?.code,
            message = message.ifEmpty { "Request failed" },
        )
    }
    return data
}

/**
 * For endpoints that return null data (logout, cart/update, etc.).
 * Only checks success flag without requiring data.
 */
fun <T> ApiResponse<T>.requireSuccess() {
    if (!success) {
        throw ApiError(
            code = code,
            errorCode = meta?.code,
            message = message.ifEmpty { "Request failed" },
        )
    }
}
