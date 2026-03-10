package com.example.shop.feature.auth.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.feature.auth.data.model.AuthResponse
import com.example.shop.feature.auth.data.model.LoginRequest
import com.example.shop.feature.auth.data.model.LogoutRequest
import com.example.shop.feature.auth.data.model.RegisterRequest
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<AuthResponse>

    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<AuthResponse>

    @POST("api/v1/auth/logout")
    suspend fun logout(@Body request: LogoutRequest): ApiResponse<JsonElement?>
}
