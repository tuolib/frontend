package com.example.shop.feature.auth.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val nickname: String? = null,
)

@Serializable
data class LogoutRequest(
    val refreshToken: String? = null,
)
