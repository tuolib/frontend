package com.example.shop.feature.auth.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val nickname: String? = null,
    val avatarUrl: String? = null,
    val phone: String? = null,
    val status: String,
    val lastLogin: String? = null,
    val createdAt: String,
    val updatedAt: String,
)
