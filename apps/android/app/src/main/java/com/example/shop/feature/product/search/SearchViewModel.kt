package com.example.shop.feature.product.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import androidx.paging.PagingSource
import androidx.paging.PagingState
import androidx.paging.cachedIn
import com.example.shop.core.network.unwrap
import com.example.shop.core.storage.SearchHistoryStore
import com.example.shop.feature.product.data.ProductApi
import com.example.shop.feature.product.data.model.ProductListItem
import com.example.shop.feature.product.data.model.SearchRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SearchUiState(
    val query: String = "",
    val isSearchActive: Boolean = false,
    val sort: String = "relevance",
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class SearchViewModel @Inject constructor(
    private val productApi: ProductApi,
    private val searchHistoryStore: SearchHistoryStore,
) : ViewModel() {

    private val _state = MutableStateFlow(SearchUiState())
    val state: StateFlow<SearchUiState> = _state.asStateFlow()

    val history: StateFlow<List<String>> = searchHistoryStore.history
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val searchTrigger = MutableStateFlow<SearchKey?>(null)

    val searchResults: Flow<PagingData<ProductListItem>> = searchTrigger
        .flatMapLatest { key ->
            if (key == null) {
                flowOf(PagingData.empty())
            } else {
                Pager(
                    config = PagingConfig(
                        pageSize = 20,
                        enablePlaceholders = false,
                    ),
                    pagingSourceFactory = {
                        SearchPagingSource(productApi, key.keyword, key.sort)
                    },
                ).flow
            }
        }
        .cachedIn(viewModelScope)

    fun onQueryChange(query: String) {
        _state.update { it.copy(query = query) }
    }

    fun onSearch(keyword: String = _state.value.query) {
        val trimmed = keyword.trim()
        if (trimmed.isEmpty()) return
        _state.update { it.copy(query = trimmed, isSearchActive = true) }
        viewModelScope.launch { searchHistoryStore.add(trimmed) }
        searchTrigger.value = SearchKey(trimmed, _state.value.sort)
    }

    fun onSortChange(sort: String) {
        _state.update { it.copy(sort = sort) }
        val query = _state.value.query.trim()
        if (query.isNotEmpty() && _state.value.isSearchActive) {
            searchTrigger.value = SearchKey(query, sort)
        }
    }

    fun onClearHistory() {
        viewModelScope.launch { searchHistoryStore.clear() }
    }

    fun onRemoveHistory(keyword: String) {
        viewModelScope.launch { searchHistoryStore.remove(keyword) }
    }

    fun onClearSearch() {
        _state.update { it.copy(query = "", isSearchActive = false) }
        searchTrigger.value = null
    }
}

private data class SearchKey(val keyword: String, val sort: String)

private class SearchPagingSource(
    private val api: ProductApi,
    private val keyword: String,
    private val sort: String,
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
            val response = api.search(
                SearchRequest(
                    keyword = keyword,
                    sort = sort,
                    page = page,
                    pageSize = 20,
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
