package com.example.shop.feature.order.create

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.shop.feature.cart.data.CartRepository
import com.example.shop.feature.cart.data.model.CheckoutPreview
import com.example.shop.feature.order.data.OrderRepository
import com.example.shop.feature.order.data.model.OrderCreateItem
import com.example.shop.feature.user.data.AddressRepository
import com.example.shop.feature.user.data.model.Address
import com.example.shop.feature.user.data.model.AddressCreateRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderCreateUiState(
    val isLoading: Boolean = true,
    val preview: CheckoutPreview? = null,
    val addresses: List<Address> = emptyList(),
    val selectedAddressId: String? = null,
    val remark: String = "",
    val isSubmitting: Boolean = false,
    val error: String? = null,
    val showAddressPicker: Boolean = false,
    val showAddressForm: Boolean = false,
    val editingAddress: Address? = null,
) {
    val selectedAddress: Address?
        get() = addresses.find { it.id == selectedAddressId }
}

sealed class OrderCreateEvent {
    data class ShowMessage(val message: String) : OrderCreateEvent()
    data class NavigateToPayment(val orderId: String) : OrderCreateEvent()
}

@HiltViewModel
class OrderCreateViewModel @Inject constructor(
    private val cartRepository: CartRepository,
    private val orderRepository: OrderRepository,
    private val addressRepository: AddressRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(OrderCreateUiState())
    val state: StateFlow<OrderCreateUiState> = _state.asStateFlow()

    private val _event = Channel<OrderCreateEvent>()
    val event = _event.receiveAsFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                val previewDeferred = async { cartRepository.checkoutPreview() }
                val addressDeferred = async { addressRepository.list() }
                val preview = previewDeferred.await()
                val addresses = addressDeferred.await()

                val defaultAddr = addresses.find { it.isDefault } ?: addresses.firstOrNull()

                _state.update {
                    it.copy(
                        isLoading = false,
                        preview = preview,
                        addresses = addresses,
                        selectedAddressId = defaultAddr?.id,
                        error = null,
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(isLoading = false, error = e.message ?: "Failed to load")
                }
            }
        }
    }

    fun selectAddress(addressId: String) {
        _state.update { it.copy(selectedAddressId = addressId, showAddressPicker = false) }
    }

    fun updateRemark(remark: String) {
        if (remark.length <= 500) {
            _state.update { it.copy(remark = remark) }
        }
    }

    fun toggleAddressPicker(show: Boolean) {
        _state.update { it.copy(showAddressPicker = show) }
    }

    fun toggleAddressForm(show: Boolean, editing: Address? = null) {
        _state.update { it.copy(showAddressForm = show, editingAddress = editing) }
    }

    fun saveAddress(request: AddressCreateRequest) {
        viewModelScope.launch {
            try {
                val address = addressRepository.create(request)
                val addresses = addressRepository.list()
                _state.update {
                    it.copy(
                        addresses = addresses,
                        selectedAddressId = it.selectedAddressId ?: address.id,
                        showAddressForm = false,
                        editingAddress = null,
                    )
                }
            } catch (e: Exception) {
                _event.send(OrderCreateEvent.ShowMessage(e.message ?: "Failed to save address"))
            }
        }
    }

    fun placeOrder() {
        val currentState = _state.value
        val preview = currentState.preview ?: return
        val addressId = currentState.selectedAddressId

        if (addressId == null) {
            viewModelScope.launch {
                _event.send(OrderCreateEvent.ShowMessage("Please select a delivery address"))
            }
            return
        }

        if (preview.items.isEmpty()) return

        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true) }
            try {
                val items = preview.items.map { item ->
                    OrderCreateItem(skuId = item.skuId, quantity = item.quantity)
                }
                val result = orderRepository.create(
                    items = items,
                    addressId = addressId,
                    remark = currentState.remark.ifBlank { null },
                )
                _state.update { it.copy(isSubmitting = false) }
                _event.send(OrderCreateEvent.NavigateToPayment(result.orderId))
            } catch (e: Exception) {
                _state.update { it.copy(isSubmitting = false) }
                _event.send(OrderCreateEvent.ShowMessage(e.message ?: "Failed to place order"))
            }
        }
    }
}
