package com.example.shop.feature.order.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.core.model.PaginatedResult
import com.example.shop.feature.order.data.model.CreateOrderResult
import com.example.shop.feature.order.data.model.OrderCancelRequest
import com.example.shop.feature.order.data.model.OrderCreateRequest
import com.example.shop.feature.order.data.model.OrderDetailRequest
import com.example.shop.feature.order.data.model.OrderDetailResult
import com.example.shop.feature.order.data.model.OrderListItem
import com.example.shop.feature.order.data.model.OrderListRequest
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.POST

interface OrderApi {
    @POST("/api/v1/order/create")
    suspend fun create(@Body request: OrderCreateRequest): ApiResponse<CreateOrderResult>

    @POST("/api/v1/order/list")
    suspend fun list(@Body request: OrderListRequest): ApiResponse<PaginatedResult<OrderListItem>>

    @POST("/api/v1/order/detail")
    suspend fun detail(@Body request: OrderDetailRequest): ApiResponse<OrderDetailResult>

    @POST("/api/v1/order/cancel")
    suspend fun cancel(@Body request: OrderCancelRequest): ApiResponse<JsonElement?>
}
