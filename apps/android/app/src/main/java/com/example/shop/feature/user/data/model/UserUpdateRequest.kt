package com.example.shop.feature.user.data.model

import kotlinx.serialization.Serializable

@Serializable
data class UserUpdateRequest(
    val nickname: String? = null,
    val avatarUrl: String? = null,
    val phone: String? = null,
)
