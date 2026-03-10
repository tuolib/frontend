package com.example.shop.feature.cart.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class CartAddRequest(val skuId: String, val quantity: Int)

@Serializable
data class CartUpdateRequest(val skuId: String, val quantity: Int)

@Serializable
data class CartRemoveRequest(val skuIds: List<String>)

@Serializable
data class CartSelectRequest(val skuIds: List<String>, val selected: Boolean)

@Serializable
data class CartItem(
    val skuId: String,
    val quantity: Int,
    val selected: Boolean,
    val productId: String,
    val productTitle: String,
    val skuCode: String,
    val price: Double,
    val comparePrice: Double? = null,
    val stock: Int,
    val attributes: JsonObject,
    val imageUrl: String? = null,
    val status: String,
)
