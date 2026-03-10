package com.example.shop.feature.user.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.feature.user.data.model.Address
import com.example.shop.feature.user.data.model.AddressCreateRequest
import com.example.shop.feature.user.data.model.AddressDeleteRequest
import com.example.shop.feature.user.data.model.AddressUpdateRequest
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import retrofit2.http.Body
import retrofit2.http.POST

interface AddressApi {
    @POST("/api/v1/user/address/list")
    suspend fun list(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<Address>>

    @POST("/api/v1/user/address/create")
    suspend fun create(@Body request: AddressCreateRequest): ApiResponse<Address>

    @POST("/api/v1/user/address/update")
    suspend fun update(@Body request: AddressUpdateRequest): ApiResponse<Address>

    @POST("/api/v1/user/address/delete")
    suspend fun delete(@Body request: AddressDeleteRequest): ApiResponse<JsonElement?>
}
