package com.example.shop.feature.product.list

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.example.shop.core.network.unwrap
import com.example.shop.feature.product.data.ProductApi
import com.example.shop.feature.product.data.model.ProductFilters
import com.example.shop.feature.product.data.model.ProductListItem
import com.example.shop.feature.product.data.model.ProductListRequest

class ProductPagingSource(
    private val api: ProductApi,
    private val sort: String,
    private val order: String,
    private val categoryId: String? = null,
) : PagingSource<Int, ProductListItem>() {

    override fun getRefreshKey(state: PagingState<Int, ProductListItem>): Int? {
        return state.anchorPosition?.let { pos ->
            state.closestPageToPosition(pos)?.let {
                it.prevKey?.plus(1) ?: it.nextKey?.minus(1)
            }
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, ProductListItem> {
        val page = params.key ?: 1
        return try {
            val response = api.list(
                ProductListRequest(
                    page = page,
                    pageSize = 20,
                    sort = sort,
                    order = order,
                    filters = categoryId?.let { ProductFilters(categoryId = it) },
                )
            ).unwrap()
            LoadResult.Page(
                data = response.items,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (page >= response.pagination.totalPages) null else page + 1,
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
}
