package com.example.shop.feature.product.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class ProductDetailRequest(val id: String)

@Serializable
data class ProductDetail(
    val id: String,
    val title: String,
    val slug: String,
    val description: String? = null,
    val brand: String? = null,
    val status: String,
    val attributes: JsonObject? = null,
    val minPrice: String? = null,
    val maxPrice: String? = null,
    val totalSales: Int,
    val avgRating: String,
    val reviewCount: Int,
    val createdAt: String,
    val updatedAt: String,
    val images: List<ProductImage>,
    val skus: List<Sku>,
    val categories: List<ProductCategory>,
)

@Serializable
data class ProductImage(
    val id: String,
    val url: String,
    val altText: String? = null,
    val isPrimary: Boolean,
    val sortOrder: Int,
)

@Serializable
data class ProductCategory(
    val id: String,
    val name: String,
    val slug: String,
)
