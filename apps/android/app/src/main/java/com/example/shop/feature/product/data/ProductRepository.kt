package com.example.shop.feature.product.data

import com.example.shop.core.model.PaginatedResult
import com.example.shop.core.network.unwrap
import com.example.shop.feature.product.data.model.ProductListItem
import com.example.shop.feature.product.data.model.ProductListRequest
import com.example.shop.feature.product.data.model.SearchRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProductRepository @Inject constructor(
    private val api: ProductApi,
) {
    suspend fun list(request: ProductListRequest): PaginatedResult<ProductListItem> {
        return api.list(request).unwrap()
    }

    suspend fun search(request: SearchRequest): PaginatedResult<ProductListItem> {
        return api.search(request).unwrap()
    }
}
