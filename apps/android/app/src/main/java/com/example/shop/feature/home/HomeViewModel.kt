package com.example.shop.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import androidx.paging.PagingSource
import androidx.paging.PagingState
import androidx.paging.cachedIn
import com.example.shop.core.network.unwrap
import com.example.shop.feature.home.component.CategoryShowcaseData
import com.example.shop.feature.home.data.HomeRepository
import com.example.shop.feature.home.data.model.Banner
import com.example.shop.feature.menu.data.CategoryRepository
import com.example.shop.feature.menu.data.model.CategoryNode
import com.example.shop.feature.product.data.ProductApi
import com.example.shop.feature.product.data.ProductRepository
import com.example.shop.feature.product.data.model.ProductListItem
import com.example.shop.feature.product.data.model.ProductListRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.supervisorScope
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val categories: List<CategoryNode> = emptyList(),
    val banners: List<Banner> = emptyList(),
    val dealItems: List<ProductListItem> = emptyList(),
    val newArrivals: List<ProductListItem> = emptyList(),
    val topRated: List<ProductListItem> = emptyList(),
    val categoryShowcases: List<CategoryShowcaseData> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeRepository: HomeRepository,
    private val productRepository: ProductRepository,
    private val categoryRepository: CategoryRepository,
    private val productApi: ProductApi,
) : ViewModel() {

    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    // Recommended products with Paging 3
    val recommendedProducts: Flow<PagingData<ProductListItem>> = Pager(
        config = PagingConfig(
            pageSize = 10,
            enablePlaceholders = false,
        ),
        pagingSourceFactory = { RecommendedPagingSource(productApi) },
    ).flow.cachedIn(viewModelScope)

    init {
        loadData()
    }

    fun refresh() {
        _state.update { it.copy(isRefreshing = true) }
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            try {
                // Use coroutineScope so child async failures propagate to try-catch
                coroutineScope {
                    // Parallel fetch
                    val categoriesDeferred = async { categoryRepository.getTree() }
                    val bannersDeferred = async { homeRepository.getBanners() }
                    val dealsDeferred = async {
                        productRepository.list(
                            ProductListRequest(
                                page = 1,
                                pageSize = 10,
                                sort = "sales",
                                order = "desc",
                            )
                        ).items
                    }
                    val newArrivalsDeferred = async {
                        productRepository.list(
                            ProductListRequest(
                                page = 1,
                                pageSize = 8,
                                sort = "createdAt",
                                order = "desc",
                            )
                        ).items
                    }

                    val categories = categoriesDeferred.await()
                    val banners = bannersDeferred.await()
                    val deals = dealsDeferred.await()
                    val newArrivals = newArrivalsDeferred.await()

                    // Top rated = deals with rating > 0
                    val topRated = deals.filter {
                        (it.avgRating.toFloatOrNull() ?: 0f) > 0f
                    }

                    // Category showcases: top 4 categories, each with 4 products
                    val showcases = supervisorScope {
                        categories.take(4).map { category ->
                            async {
                                try {
                                    val products = productRepository.list(
                                        ProductListRequest(
                                            page = 1,
                                            pageSize = 4,
                                            sort = "sales",
                                            order = "desc",
                                            filters = com.example.shop.feature.product.data.model.ProductFilters(
                                                categoryId = category.id,
                                            ),
                                        )
                                    ).items
                                    CategoryShowcaseData(category, products)
                                } catch (_: Exception) {
                                    CategoryShowcaseData(category, emptyList())
                                }
                            }
                        }.map { it.await() }
                    }

                    _state.update {
                        it.copy(
                            isLoading = false,
                            isRefreshing = false,
                            categories = categories,
                            banners = banners,
                            dealItems = deals,
                            newArrivals = newArrivals,
                            topRated = topRated,
                            categoryShowcases = showcases,
                            error = null,
                        )
                    }
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = e.message ?: "Failed to load",
                    )
                }
            }
        }
    }
}

private class RecommendedPagingSource(
    private val api: ProductApi,
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
                    pageSize = 10,
                    sort = "createdAt",
                    order = "desc",
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
