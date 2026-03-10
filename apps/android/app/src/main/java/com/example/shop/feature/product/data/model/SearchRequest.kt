package com.example.shop.feature.product.data.model

import kotlinx.serialization.Serializable

@Serializable
data class SearchRequest(
    val keyword: String,
    val categoryId: String? = null,
    val priceMin: Double? = null,
    val priceMax: Double? = null,
    val sort: String = "relevance",
    val page: Int = 1,
    val pageSize: Int = 20,
)
