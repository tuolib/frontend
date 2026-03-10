package com.example.shop.feature.product.data

import com.example.shop.core.model.ApiResponse
import com.example.shop.core.model.PaginatedResult
import com.example.shop.feature.product.data.model.ProductDetail
import com.example.shop.feature.product.data.model.ProductDetailRequest
import com.example.shop.feature.product.data.model.ProductListItem
import com.example.shop.feature.product.data.model.ProductListRequest
import com.example.shop.feature.product.data.model.SearchRequest
import retrofit2.http.Body
import retrofit2.http.POST

interface ProductApi {
    @POST("/api/v1/product/list")
    suspend fun list(@Body request: ProductListRequest): ApiResponse<PaginatedResult<ProductListItem>>

    @POST("/api/v1/product/detail")
    suspend fun detail(@Body request: ProductDetailRequest): ApiResponse<ProductDetail>

    @POST("/api/v1/product/search")
    suspend fun search(@Body request: SearchRequest): ApiResponse<PaginatedResult<ProductListItem>>
}
