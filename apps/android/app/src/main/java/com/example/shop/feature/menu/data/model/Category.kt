package com.example.shop.feature.menu.data.model

import kotlinx.serialization.Serializable

@Serializable
data class CategoryNode(
    val id: String,
    val name: String,
    val slug: String,
    val iconUrl: String? = null,
    val sortOrder: Int,
    val isActive: Boolean,
    val children: List<CategoryNode> = emptyList(),
)
