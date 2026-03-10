package com.example.shop.feature.order.data

import com.example.shop.core.model.PaginatedResult
import com.example.shop.core.network.requireSuccess
import com.example.shop.core.network.unwrap
import com.example.shop.feature.order.data.model.CreateOrderResult
import com.example.shop.feature.order.data.model.OrderCancelRequest
import com.example.shop.feature.order.data.model.OrderCreateItem
import com.example.shop.feature.order.data.model.OrderCreateRequest
import com.example.shop.feature.order.data.model.OrderDetailRequest
import com.example.shop.feature.order.data.model.OrderDetailResult
import com.example.shop.feature.order.data.model.OrderListItem
import com.example.shop.feature.order.data.model.OrderListRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val api: OrderApi,
) {
    suspend fun create(
        items: List<OrderCreateItem>,
        addressId: String,
        remark: String? = null,
    ): CreateOrderResult {
        return api.create(OrderCreateRequest(items, addressId, remark)).unwrap()
    }

    suspend fun list(
        page: Int = 1,
        pageSize: Int = 10,
        status: String? = null,
    ): PaginatedResult<OrderListItem> {
        return api.list(OrderListRequest(page, pageSize, status)).unwrap()
    }

    suspend fun detail(orderId: String): OrderDetailResult {
        return api.detail(OrderDetailRequest(orderId)).unwrap()
    }

    suspend fun cancel(orderId: String, reason: String? = null) {
        api.cancel(OrderCancelRequest(orderId, reason)).requireSuccess()
    }
}
