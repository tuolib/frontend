package com.example.shop.core.model

import kotlinx.serialization.Serializable

@Serializable
data class ApiResponse<T>(
    val code: Int,
    val success: Boolean,
    val data: T? = null,
    val message: String = "",
    val traceId: String = "",
    val meta: ErrorMeta? = null,
)

@Serializable
data class ErrorMeta(
    val code: String = "",
    val message: String = "",
)
