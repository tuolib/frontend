package com.example.shop.feature.menu.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.feature.menu.data.model.CategoryNode
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import retrofit2.http.Body
import retrofit2.http.POST

interface CategoryApi {
    @POST("/api/v1/category/tree")
    suspend fun tree(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<CategoryNode>>
}
