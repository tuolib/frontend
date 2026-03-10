package com.example.shop.feature.order.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class OrderItemData(
    val id: String = "",
    val productId: String = "",
    val skuId: String,
    val productTitle: String,
    val skuAttrs: JsonObject? = null,
    val imageUrl: String? = null,
    val unitPrice: String = "0",
    val quantity: Int,
    val subtotal: String = "0",
)

@Serializable
data class OrderAddressData(
    val recipient: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val address: String,
    val postalCode: String? = null,
)
