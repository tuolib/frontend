package com.example.shop.feature.order.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

// ── Order Status Constants ──

object OrderStatus {
    const val PENDING = "pending"
    const val PAID = "paid"
    const val SHIPPED = "shipped"
    const val DELIVERED = "delivered"
    const val COMPLETED = "completed"
    const val CANCELLED = "cancelled"
    const val REFUNDED = "refunded"
}

// ── Requests ──

@Serializable
data class OrderCreateRequest(
    val items: List<OrderCreateItem>,
    val addressId: String,
    val remark: String? = null,
)

@Serializable
data class OrderCreateItem(
    val skuId: String,
    val quantity: Int,
)

@Serializable
data class OrderListRequest(
    val page: Int = 1,
    val pageSize: Int = 10,
    val status: String? = null,
)

@Serializable
data class OrderDetailRequest(val orderId: String)

@Serializable
data class OrderCancelRequest(
    val orderId: String,
    val reason: String? = null,
)

// ── Create Response ──

@Serializable
data class CreateOrderResult(
    val orderId: String,
    val orderNo: String,
    val payAmount: String,
    val expiresAt: String,
)

// ── List Item (lightweight) ──

@Serializable
data class OrderListItem(
    val orderId: String,
    val orderNo: String,
    val status: String,
    val payAmount: String,
    val itemCount: Int = 0,
    val firstItem: OrderFirstItem? = null,
    val createdAt: String,
)

@Serializable
data class OrderFirstItem(
    val productTitle: String,
    val imageUrl: String? = null,
    val skuAttrs: JsonObject? = null,
)

// ── Detail (full) ──

@Serializable
data class OrderDetailResult(
    val orderId: String,
    val orderNo: String,
    val status: String,
    val totalAmount: String = "0",
    val discountAmount: String = "0",
    val payAmount: String,
    val remark: String? = null,
    val expiresAt: String? = null,
    val paidAt: String? = null,
    val shippedAt: String? = null,
    val deliveredAt: String? = null,
    val completedAt: String? = null,
    val cancelledAt: String? = null,
    val cancelReason: String? = null,
    val createdAt: String,
    val items: List<OrderItemData> = emptyList(),
    val address: OrderAddressData? = null,
)
