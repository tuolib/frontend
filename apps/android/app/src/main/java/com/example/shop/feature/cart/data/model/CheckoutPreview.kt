package com.example.shop.feature.cart.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

@Serializable
data class CheckoutPreview(
    val items: List<CheckoutPreviewItem> = emptyList(),
    val summary: CheckoutSummary = CheckoutSummary(),
    val warnings: CheckoutWarnings = CheckoutWarnings(),
    val canCheckout: Boolean = true,
)

@Serializable
data class CheckoutSummary(
    val itemsTotal: String = "0",
    val shippingFee: String = "0",
    val discountAmount: String = "0",
    val payAmount: String = "0",
)

@Serializable
data class CheckoutWarnings(
    val unavailableItems: List<JsonElement> = emptyList(),
    val priceChangedItems: List<JsonElement> = emptyList(),
    val insufficientItems: List<JsonElement> = emptyList(),
)

@Serializable
data class CheckoutPreviewItem(
    val skuId: String,
    val quantity: Int,
    val currentPrice: String = "0",
    val currentStock: Int = 0,
    val productId: String = "",
    val productTitle: String = "",
    val skuAttrs: JsonObject? = null,
    val imageUrl: String? = null,
)
