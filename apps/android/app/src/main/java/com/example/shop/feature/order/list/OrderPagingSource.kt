package com.example.shop.feature.order.list

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.example.shop.feature.order.data.OrderApi
import com.example.shop.feature.order.data.model.OrderListItem
import com.example.shop.feature.order.data.model.OrderListRequest
import com.example.shop.core.network.unwrap

class OrderPagingSource(
    private val api: OrderApi,
    private val status: String?,
) : PagingSource<Int, OrderListItem>() {

    override fun getRefreshKey(state: PagingState<Int, OrderListItem>): Int? {
        return state.anchorPosition?.let { pos ->
            state.closestPageToPosition(pos)?.let {
                it.prevKey?.plus(1) ?: it.nextKey?.minus(1)
            }
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, OrderListItem> {
        val page = params.key ?: 1
        return try {
            val result = api.list(
                OrderListRequest(page = page, pageSize = 10, status = status)
            ).unwrap()
            LoadResult.Page(
                data = result.items,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (page >= result.pagination.totalPages) null else page + 1,
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
}
