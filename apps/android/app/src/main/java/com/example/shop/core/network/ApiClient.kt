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
