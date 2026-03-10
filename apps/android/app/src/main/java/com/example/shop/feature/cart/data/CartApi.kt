package com.example.shop.feature.cart.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.feature.cart.data.model.CartAddRequest
import com.example.shop.feature.cart.data.model.CartItemResponse
import com.example.shop.feature.cart.data.model.CartRemoveRequest
import com.example.shop.feature.cart.data.model.CartSelectRequest
import com.example.shop.feature.cart.data.model.CartUpdateRequest
import com.example.shop.feature.cart.data.model.CheckoutPreview
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import retrofit2.http.Body
import retrofit2.http.POST

interface CartApi {
    @POST("/api/v1/cart/list")
    suspend fun list(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<CartItemResponse>>

    @POST("/api/v1/cart/add")
    suspend fun add(@Body request: CartAddRequest): ApiResponse<JsonElement?>

    @POST("/api/v1/cart/update")
    suspend fun update(@Body request: CartUpdateRequest): ApiResponse<JsonElement?>

    @POST("/api/v1/cart/remove")
    suspend fun remove(@Body request: CartRemoveRequest): ApiResponse<JsonElement?>

    @POST("/api/v1/cart/select")
    suspend fun select(@Body request: CartSelectRequest): ApiResponse<JsonElement?>

    @POST("/api/v1/cart/checkout/preview")
    suspend fun checkoutPreview(@Body body: JsonObject = buildJsonObject {}): ApiResponse<CheckoutPreview>
}
