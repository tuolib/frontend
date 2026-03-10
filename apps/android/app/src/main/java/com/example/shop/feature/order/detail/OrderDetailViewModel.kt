package com.example.shop.feature.order.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.example.shop.feature.order.data.OrderRepository
import com.example.shop.feature.order.data.model.OrderDetailResult
import com.example.shop.feature.order.data.model.OrderStatus
import com.example.shop.navigation.OrderDetailRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderDetailUiState(
    val isLoading: Boolean = true,
    val order: OrderDetailResult? = null,
    val error: String? = null,
    val showCancelDialog: Boolean = false,
    val isCancelling: Boolean = false,
)

sealed class OrderDetailEvent {
    data class ShowMessage(val message: String) : OrderDetailEvent()
    data class NavigateToPayment(val orderId: String) : OrderDetailEvent()
    data object NavigateBack : OrderDetailEvent()
}

@HiltViewModel
class OrderDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val orderRepository: OrderRepository,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<OrderDetailRoute>()
    val orderId = route.orderId

    private val _state = MutableStateFlow(OrderDetailUiState())
    val state: StateFlow<OrderDetailUiState> = _state.asStateFlow()

    private val _event = Channel<OrderDetailEvent>()
    val event = _event.receiveAsFlow()

    init {
        loadOrder()
    }

    fun refresh() {
        loadOrder()
    }

    private fun loadOrder() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                val order = orderRepository.detail(orderId)
                _state.update { it.copy(isLoading = false, order = order, error = null) }
            } catch (e: Exception) {
                _state.update {
                    it.copy(isLoading = false, error = e.message ?: "Failed to load order")
                }
            }
        }
    }

    fun showCancelDialog() {
        _state.update { it.copy(showCancelDialog = true) }
    }

    fun dismissCancelDialog() {
        _state.update { it.copy(showCancelDialog = false) }
    }

    fun cancelOrder(reason: String? = null) {
        viewModelScope.launch {
            _state.update { it.copy(isCancelling = true, showCancelDialog = false) }
            try {
                orderRepository.cancel(orderId, reason)
                _event.send(OrderDetailEvent.ShowMessage("Order cancelled"))
                loadOrder()
            } catch (e: Exception) {
                _event.send(OrderDetailEvent.ShowMessage(e.message ?: "Failed to cancel"))
            } finally {
                _state.update { it.copy(isCancelling = false) }
            }
        }
    }

    fun goToPayment() {
        viewModelScope.launch {
            _event.send(OrderDetailEvent.NavigateToPayment(orderId))
        }
    }
}
