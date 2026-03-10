package com.example.shop.feature.cart.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject

@Serializable
data class CartAddRequest(val skuId: String, val quantity: Int)

@Serializable
data class CartUpdateRequest(val skuId: String, val quantity: Int)

@Serializable
data class CartRemoveRequest(val skuIds: List<String>)

@Serializable
data class CartSelectRequest(val skuIds: List<String>, val selected: Boolean)

// ── API response models ──

@Serializable
data class CartItemResponse(
    val skuId: String,
    val quantity: Int,
    val selected: Boolean,
    val snapshot: CartItemSnapshot,
    val currentPrice: String,
    val currentStock: Int,
    val priceChanged: Boolean = false,
    val unavailable: Boolean = false,
    val stockInsufficient: Boolean = false,
)

@Serializable
data class CartItemSnapshot(
    val productId: String,
    val productTitle: String,
    val skuAttrs: JsonObject = buildJsonObject {},
    val price: String = "0",
    val imageUrl: String? = null,
)

// ── Domain model used by UI ──

data class CartItem(
    val skuId: String,
    val quantity: Int,
    val selected: Boolean,
    val productId: String,
    val productTitle: String,
    val price: Double,
    val stock: Int,
    val attributes: JsonObject,
    val imageUrl: String? = null,
)
