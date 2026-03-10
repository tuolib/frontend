package com.example.shop.feature.order.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.feature.order.data.model.PaymentCreateRequest
import com.example.shop.feature.order.data.model.PaymentInfo
import com.example.shop.feature.order.data.model.PaymentNotifyRequest
import com.example.shop.feature.order.data.model.PaymentQueryRequest
import com.example.shop.feature.order.data.model.PaymentStatusResult
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.POST

interface PaymentApi {
    @POST("/api/v1/payment/create")
    suspend fun create(@Body request: PaymentCreateRequest): ApiResponse<PaymentInfo>

    @POST("/api/v1/payment/query")
    suspend fun query(@Body request: PaymentQueryRequest): ApiResponse<PaymentStatusResult>

    @POST("/api/v1/payment/notify")
    suspend fun notify(@Body request: PaymentNotifyRequest): ApiResponse<JsonElement?>
}
