package com.example.shop.feature.user.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.feature.auth.data.model.User
import com.example.shop.feature.user.data.model.UserUpdateRequest
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import retrofit2.http.Body
import retrofit2.http.POST

interface UserApi {
    @POST("/api/v1/user/profile")
    suspend fun profile(@Body body: JsonObject = buildJsonObject {}): ApiResponse<User>

    @POST("/api/v1/user/update")
    suspend fun update(@Body request: UserUpdateRequest): ApiResponse<User>
}
