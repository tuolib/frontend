package com.example.shop.core.model

import kotlinx.serialization.Serializable

@Serializable
data class PaginatedResult<T>(
    val items: List<T>,
    val pagination: Pagination,
)

@Serializable
data class Pagination(
    val page: Int,
    val pageSize: Int,
    val total: Int,
    val totalPages: Int,
)
