package com.example.shop.feature.cart.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class CheckoutPreview(
    val items: List<CheckoutPreviewItem>,
    val totalAmount: Double,
    val totalQuantity: Int,
)

@Serializable
data class CheckoutPreviewItem(
    val skuId: String,
    val quantity: Int,
    val productId: String,
    val productTitle: String,
    val skuCode: String,
    val price: Double,
    val attributes: JsonObject,
    val imageUrl: String? = null,
    val subtotal: Double,
)
