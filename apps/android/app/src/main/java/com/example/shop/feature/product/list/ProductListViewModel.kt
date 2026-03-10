package com.example.shop.feature.product.list

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.example.shop.feature.product.data.ProductApi
import com.example.shop.feature.product.data.model.ProductListItem
import com.example.shop.navigation.ProductListRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.update
import javax.inject.Inject

data class ProductListUiState(
    val categoryName: String? = null,
    val sort: String = "createdAt",
    val order: String = "desc",
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class ProductListViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val productApi: ProductApi,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<ProductListRoute>()
    private val categoryId = route.categoryId

    private val _state = MutableStateFlow(
        ProductListUiState(categoryName = route.categoryName)
    )
    val state: StateFlow<ProductListUiState> = _state.asStateFlow()

    private val sortTrigger = MutableStateFlow(SortKey("createdAt", "desc"))

    val products: Flow<PagingData<ProductListItem>> = sortTrigger
        .flatMapLatest { key ->
            Pager(
                config = PagingConfig(
                    pageSize = 20,
                    enablePlaceholders = false,
                ),
                pagingSourceFactory = {
                    ProductPagingSource(
                        api = productApi,
                        sort = key.sort,
                        order = key.order,
                        categoryId = categoryId,
                    )
                },
            ).flow
        }
        .cachedIn(viewModelScope)

    fun onSortChange(sort: String, order: String) {
        _state.update { it.copy(sort = sort, order = order) }
        sortTrigger.value = SortKey(sort, order)
    }
}

private data class SortKey(val sort: String, val order: String)
