package com.example.shop.core.network

class ApiError(
    val code: Int,
    val errorCode: String?,
    override val message: String,
) : Exception(message) {
    fun `is`(expected: String): Boolean = errorCode == expected
}
