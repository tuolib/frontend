package com.example.shop.feature.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.shop.feature.menu.data.CategoryRepository
import com.example.shop.feature.menu.data.model.CategoryNode
import com.example.shop.feature.product.data.ProductRepository
import com.example.shop.feature.product.data.model.ProductFilters
import com.example.shop.feature.product.data.model.ProductListItem
import com.example.shop.feature.product.data.model.ProductListRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MenuUiState(
    val isLoading: Boolean = true,
    val categories: List<CategoryNode> = emptyList(),
    val selectedIndex: Int = 0,
    val error: String? = null,
    val popularProducts: List<ProductListItem> = emptyList(),
    val popularLoading: Boolean = false,
)

@HiltViewModel
class MenuViewModel @Inject constructor(
    private val categoryRepository: CategoryRepository,
    private val productRepository: ProductRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(MenuUiState())
    val state: StateFlow<MenuUiState> = _state.asStateFlow()

    init {
        loadCategories()
    }

    fun onSelectCategory(index: Int) {
        _state.update { it.copy(selectedIndex = index) }
        loadPopularProducts()
    }

    fun refresh() {
        loadCategories()
    }

    private fun loadCategories() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                val categories = categoryRepository.getTree()
                _state.update {
                    it.copy(
                        isLoading = false,
                        categories = categories,
                        selectedIndex = 0,
                        error = null,
                    )
                }
                if (categories.isNotEmpty()) {
                    loadPopularProducts()
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load categories",
                    )
                }
            }
        }
    }

    private fun loadPopularProducts() {
        val category = _state.value.categories.getOrNull(_state.value.selectedIndex) ?: return
        viewModelScope.launch {
            _state.update { it.copy(popularLoading = true) }
            try {
                val result = productRepository.list(
                    ProductListRequest(
                        page = 1,
                        pageSize = 6,
                        sort = "sales",
                        order = "desc",
                        filters = ProductFilters(categoryId = category.id),
                    ),
                )
                _state.update { it.copy(popularLoading = false, popularProducts = result.items) }
            } catch (_: Exception) {
                _state.update { it.copy(popularLoading = false, popularProducts = emptyList()) }
            }
        }
    }
}
