package com.example.shop.feature.home.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Banner(
    val id: String,
    val title: String,
    val subtitle: String? = null,
    val imageUrl: String,
    val linkType: String,
    val linkValue: String? = null,
    val sortOrder: Int,
    val isActive: Boolean,
    val startAt: String? = null,
    val endAt: String? = null,
    val createdAt: String,
    val updatedAt: String,
)
