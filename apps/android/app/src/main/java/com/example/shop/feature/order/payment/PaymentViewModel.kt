package com.example.shop.feature.order.payment

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.example.shop.feature.order.data.OrderRepository
import com.example.shop.feature.order.data.PaymentRepository
import com.example.shop.navigation.PaymentRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant
import javax.inject.Inject

data class PaymentUiState(
    val isLoading: Boolean = true,
    val payAmount: String = "0",
    val orderNo: String = "",
    val selectedMethod: String = "mock",
    val remainingMinutes: Int = 0,
    val remainingSeconds: Int = 0,
    val isExpired: Boolean = false,
    val isPaying: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null,
)

sealed class PaymentEvent {
    data class ShowMessage(val message: String) : PaymentEvent()
    data class NavigateToOrderDetail(val orderId: String) : PaymentEvent()
    data object NavigateToHome : PaymentEvent()
}

@HiltViewModel
class PaymentViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val orderRepository: OrderRepository,
    private val paymentRepository: PaymentRepository,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<PaymentRoute>()
    val orderId = route.orderId

    private val _state = MutableStateFlow(PaymentUiState())
    val state: StateFlow<PaymentUiState> = _state.asStateFlow()

    private val _event = Channel<PaymentEvent>()
    val event = _event.receiveAsFlow()

    init {
        loadOrder()
    }

    private fun loadOrder() {
        viewModelScope.launch {
            try {
                val order = orderRepository.detail(orderId)
                _state.update {
                    it.copy(
                        isLoading = false,
                        payAmount = order.payAmount,
                        orderNo = order.orderNo,
                        error = null,
                    )
                }
                order.expiresAt?.let { startCountdown(it) }
            } catch (e: Exception) {
                _state.update {
                    it.copy(isLoading = false, error = e.message ?: "Failed to load")
                }
            }
        }
    }

    private fun startCountdown(expiresAt: String) {
        viewModelScope.launch {
            try {
                val expiryInstant = Instant.parse(expiresAt)
                while (true) {
                    val remaining = Duration.between(Instant.now(), expiryInstant)
                    if (remaining.isNegative) {
                        _state.update { it.copy(isExpired = true) }
                        break
                    }
                    _state.update {
                        it.copy(
                            remainingMinutes = remaining.toMinutes().toInt(),
                            remainingSeconds = (remaining.seconds % 60).toInt(),
                        )
                    }
                    delay(1000)
                }
            } catch (_: Exception) {
                // Invalid date format, ignore countdown
            }
        }
    }

    fun selectMethod(method: String) {
        _state.update { it.copy(selectedMethod = method) }
    }

    fun pay() {
        if (_state.value.isExpired) {
            viewModelScope.launch {
                _event.send(PaymentEvent.ShowMessage("Order has expired"))
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(isPaying = true) }
            try {
                val method = _state.value.selectedMethod
                val paymentInfo = paymentRepository.create(orderId, method)

                // For mock payment, automatically notify
                if (method == "mock") {
                    val amount = _state.value.payAmount.toDoubleOrNull() ?: 0.0
                    paymentRepository.notify(
                        orderId = orderId,
                        transactionId = "mock_${System.currentTimeMillis()}",
                        status = "success",
                        amount = amount,
                        method = "mock",
                    )
                }

                _state.update { it.copy(isPaying = false, isSuccess = true) }
            } catch (e: Exception) {
                _state.update { it.copy(isPaying = false) }
                _event.send(PaymentEvent.ShowMessage(e.message ?: "Payment failed"))
            }
        }
    }

    fun goToOrderDetail() {
        viewModelScope.launch {
            _event.send(PaymentEvent.NavigateToOrderDetail(orderId))
        }
    }

    fun goToHome() {
        viewModelScope.launch {
            _event.send(PaymentEvent.NavigateToHome)
        }
    }
}
