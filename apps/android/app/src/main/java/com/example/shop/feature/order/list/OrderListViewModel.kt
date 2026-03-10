package com.example.shop.feature.order.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.example.shop.feature.order.data.OrderApi
import com.example.shop.feature.order.data.model.OrderListItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import javax.inject.Inject

data class OrderTab(
    val label: String,
    val status: String?,
)

val ORDER_TABS = listOf(
    OrderTab("All", null),
    OrderTab("Pending", "pending"),
    OrderTab("Paid", "paid"),
    OrderTab("Shipped", "shipped"),
    OrderTab("Delivered", "delivered"),
    OrderTab("Completed", "completed"),
    OrderTab("Cancelled", "cancelled"),
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class OrderListViewModel @Inject constructor(
    private val orderApi: OrderApi,
) : ViewModel() {

    private val _selectedTabIndex = MutableStateFlow(0)
    val selectedTabIndex: StateFlow<Int> = _selectedTabIndex.asStateFlow()

    val orders: Flow<PagingData<OrderListItem>> = _selectedTabIndex
        .flatMapLatest { tabIndex ->
            val status = ORDER_TABS[tabIndex].status
            Pager(
                config = PagingConfig(pageSize = 10, enablePlaceholders = false),
                pagingSourceFactory = { OrderPagingSource(orderApi, status) },
            ).flow
        }
        .cachedIn(viewModelScope)

    fun selectTab(index: Int) {
        _selectedTabIndex.value = index
    }
}
