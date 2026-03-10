package com.example.shop.feature.product.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ProductListRequest(
    val page: Int = 1,
    val pageSize: Int = 20,
    val sort: String = "createdAt",
    val order: String = "desc",
    val filters: ProductFilters? = null,
)

@Serializable
data class ProductFilters(
    val status: String? = null,
    val categoryId: String? = null,
    val brand: String? = null,
)

@Serializable
data class ProductListItem(
    val id: String,
    val title: String,
    val slug: String,
    val brand: String? = null,
    val status: String,
    val minPrice: String? = null,
    val maxPrice: String? = null,
    val totalSales: Int,
    val avgRating: String,
    val reviewCount: Int,
    val primaryImage: String? = null,
    val createdAt: String,
)
