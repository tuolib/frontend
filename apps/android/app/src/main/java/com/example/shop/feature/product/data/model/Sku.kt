package com.example.shop.feature.product.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class Sku(
    val id: String,
    val skuCode: String,
    val price: String,
    val comparePrice: String? = null,
    val stock: Int,
    val attributes: JsonObject,
    val status: String,
)
