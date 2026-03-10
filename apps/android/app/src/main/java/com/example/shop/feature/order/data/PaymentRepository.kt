package com.example.shop.feature.order.data

import com.example.shop.core.network.requireSuccess
import com.example.shop.core.network.unwrap
import com.example.shop.feature.order.data.model.PaymentCreateRequest
import com.example.shop.feature.order.data.model.PaymentInfo
import com.example.shop.feature.order.data.model.PaymentNotifyRequest
import com.example.shop.feature.order.data.model.PaymentQueryRequest
import com.example.shop.feature.order.data.model.PaymentStatusResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PaymentRepository @Inject constructor(
    private val api: PaymentApi,
) {
    suspend fun create(orderId: String, method: String = "mock"): PaymentInfo {
        return api.create(PaymentCreateRequest(orderId, method)).unwrap()
    }

    suspend fun query(orderId: String): PaymentStatusResult {
        return api.query(PaymentQueryRequest(orderId)).unwrap()
    }

    suspend fun notify(
        orderId: String,
        transactionId: String,
        status: String,
        amount: Double,
        method: String,
    ) {
        api.notify(PaymentNotifyRequest(orderId, transactionId, status, amount, method)).requireSuccess()
    }
}
