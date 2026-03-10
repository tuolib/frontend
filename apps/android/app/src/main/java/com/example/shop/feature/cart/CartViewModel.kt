package com.example.shop.feature.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.shop.core.storage.TokenStore
import com.example.shop.feature.cart.data.CartRepository
import com.example.shop.feature.cart.data.model.CartItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CartUiState(
    val isLoading: Boolean = true,
    val isLoggedIn: Boolean = true,
    val items: List<CartItem> = emptyList(),
    val error: String? = null,
) {
    val selectedItems: List<CartItem> get() = items.filter { it.selected }
    val selectedCount: Int get() = selectedItems.sumOf { it.quantity }
    val subtotal: Double get() = selectedItems.sumOf { it.price * it.quantity }
    val isAllSelected: Boolean get() = items.isNotEmpty() && items.all { it.selected }
}

sealed class CartEvent {
    data class ShowMessage(val message: String) : CartEvent()
    data object NavigateToLogin : CartEvent()
    data object NavigateToCheckout : CartEvent()
}

@OptIn(FlowPreview::class)
@HiltViewModel
class CartViewModel @Inject constructor(
    private val cartRepository: CartRepository,
    private val tokenStore: TokenStore,
) : ViewModel() {

    private val _state = MutableStateFlow(CartUiState())
    val state: StateFlow<CartUiState> = _state.asStateFlow()

    private val _event = Channel<CartEvent>()
    val event = _event.receiveAsFlow()

    // Debounced quantity updates
    private val quantityUpdates = MutableSharedFlow<Pair<String, Int>>()

    private var lastRefreshTime = 0L

    init {
        viewModelScope.launch {
            quantityUpdates
                .debounce(300)
                .collect { (skuId, qty) ->
                    try {
                        cartRepository.update(skuId, qty)
                    } catch (e: Exception) {
                        // Reload on failure to sync
                        loadCart()
                        _event.send(CartEvent.ShowMessage(e.message ?: "Update failed"))
                    }
                }
        }
        // Initial load (first time ViewModel is created)
        onScreenVisible()
    }

    /**
     * Called every time the CartScreen enters composition.
     * Shows loading spinner only if cart is empty (first load);
     * otherwise silently refreshes in background.
     * Skips if called again within 500ms (guards against duplicate calls).
     */
    fun onScreenVisible() {
        val now = System.currentTimeMillis()
        if (now - lastRefreshTime < 500) return
        lastRefreshTime = now
        loadCart(showLoading = _state.value.items.isEmpty() && !_state.value.isLoading)
    }

    fun refresh() {
        lastRefreshTime = System.currentTimeMillis()
        loadCart(showLoading = false)
    }

    private fun loadCart(showLoading: Boolean = false) {
        viewModelScope.launch {
            val isLoggedIn = tokenStore.accessToken.first() != null
            if (!isLoggedIn) {
                _state.update { it.copy(isLoading = false, isLoggedIn = false, items = emptyList()) }
                return@launch
            }
            if (showLoading) {
                _state.update { it.copy(isLoading = true, isLoggedIn = true) }
            } else {
                _state.update { it.copy(isLoggedIn = true) }
            }

            try {
                val items = cartRepository.list()
                _state.update {
                    it.copy(isLoading = false, items = items, error = null)
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(isLoading = false, error = e.message ?: "Failed to load cart")
                }
            }
        }
    }

    fun updateQuantity(skuId: String, quantity: Int) {
        if (quantity < 1) return
        // Optimistic update
        _state.update { s ->
            s.copy(items = s.items.map {
                if (it.skuId == skuId) it.copy(quantity = quantity) else it
            })
        }
        viewModelScope.launch { quantityUpdates.emit(skuId to quantity) }
    }

    fun toggleSelect(skuId: String) {
        val item = _state.value.items.find { it.skuId == skuId } ?: return
        val newSelected = !item.selected

        // Optimistic update
        _state.update { s ->
            s.copy(items = s.items.map {
                if (it.skuId == skuId) it.copy(selected = newSelected) else it
            })
        }

        viewModelScope.launch {
            try {
                cartRepository.select(listOf(skuId), newSelected)
            } catch (e: Exception) {
                loadCart()
                _event.send(CartEvent.ShowMessage(e.message ?: "Failed"))
            }
        }
    }

    fun toggleSelectAll() {
        val allSelected = _state.value.isAllSelected
        val newSelected = !allSelected
        val allSkuIds = _state.value.items.map { it.skuId }

        if (allSkuIds.isEmpty()) return

        // Optimistic update
        _state.update { s ->
            s.copy(items = s.items.map { it.copy(selected = newSelected) })
        }

        viewModelScope.launch {
            try {
                cartRepository.select(allSkuIds, newSelected)
            } catch (e: Exception) {
                loadCart()
                _event.send(CartEvent.ShowMessage(e.message ?: "Failed"))
            }
        }
    }

    fun removeItem(skuId: String) {
        // Optimistic update
        _state.update { s ->
            s.copy(items = s.items.filter { it.skuId != skuId })
        }

        viewModelScope.launch {
            try {
                cartRepository.remove(listOf(skuId))
            } catch (e: Exception) {
                loadCart()
                _event.send(CartEvent.ShowMessage(e.message ?: "Failed"))
            }
        }
    }

    fun checkout() {
        if (_state.value.selectedItems.isEmpty()) return
        viewModelScope.launch {
            _event.send(CartEvent.NavigateToCheckout)
        }
    }

    fun goToLogin() {
        viewModelScope.launch {
            _event.send(CartEvent.NavigateToLogin)
        }
    }
}
