package com.example.shop.feature.order.data.model

import kotlinx.serialization.Serializable

// ── Requests ──

@Serializable
data class PaymentCreateRequest(
    val orderId: String,
    val method: String = "mock",
)

@Serializable
data class PaymentQueryRequest(val orderId: String)

@Serializable
data class PaymentNotifyRequest(
    val orderId: String,
    val transactionId: String,
    val status: String,
    val amount: Double,
    val method: String,
)

// ── Responses ──

@Serializable
data class PaymentInfo(
    val paymentId: String,
    val method: String,
    val amount: String,
    val payUrl: String = "",
)

@Serializable
data class PaymentStatusResult(
    val orderId: String,
    val orderStatus: String,
    val payments: List<PaymentRecord> = emptyList(),
)

@Serializable
data class PaymentRecord(
    val id: String,
    val method: String,
    val amount: String,
    val status: String,
    val transactionId: String? = null,
    val createdAt: String = "",
)
