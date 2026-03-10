package com.example.shop.feature.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.shop.feature.menu.data.CategoryRepository
import com.example.shop.feature.menu.data.model.CategoryNode
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
)

@HiltViewModel
class MenuViewModel @Inject constructor(
    private val categoryRepository: CategoryRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(MenuUiState())
    val state: StateFlow<MenuUiState> = _state.asStateFlow()

    init {
        loadCategories()
    }

    fun onSelectCategory(index: Int) {
        _state.update { it.copy(selectedIndex = index) }
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
}
