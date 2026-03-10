package com.example.shop.feature.home.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.feature.home.data.model.Banner
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import retrofit2.http.Body
import retrofit2.http.POST

interface HomeApi {
    @POST("api/v1/banner/list")
    suspend fun getBanners(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<Banner>>
}
