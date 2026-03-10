package com.example.shop.feature.user.address

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.shop.feature.user.data.AddressRepository
import com.example.shop.feature.user.data.model.Address
import com.example.shop.feature.user.data.model.AddressCreateRequest
import com.example.shop.feature.user.data.model.AddressUpdateRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AddressUiState(
    val isLoading: Boolean = true,
    val addresses: List<Address> = emptyList(),
    val error: String? = null,
    val showForm: Boolean = false,
    val editingAddress: Address? = null,
    val isSaving: Boolean = false,
    val showDeleteDialog: Address? = null,
)

sealed class AddressEvent {
    data class ShowMessage(val message: String) : AddressEvent()
}

@HiltViewModel
class AddressViewModel @Inject constructor(
    private val addressRepository: AddressRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AddressUiState())
    val state: StateFlow<AddressUiState> = _state.asStateFlow()

    private val _event = Channel<AddressEvent>()
    val event = _event.receiveAsFlow()

    init {
        loadAddresses()
    }

    fun refresh() {
        loadAddresses()
    }

    private fun loadAddresses() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                val addresses = addressRepository.list()
                _state.update {
                    it.copy(isLoading = false, addresses = addresses, error = null)
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(isLoading = false, error = e.message ?: "Failed to load")
                }
            }
        }
    }

    fun showAddForm() {
        _state.update { it.copy(showForm = true, editingAddress = null) }
    }

    fun showEditForm(address: Address) {
        _state.update { it.copy(showForm = true, editingAddress = address) }
    }

    fun dismissForm() {
        _state.update { it.copy(showForm = false, editingAddress = null) }
    }

    fun showDeleteConfirm(address: Address) {
        _state.update { it.copy(showDeleteDialog = address) }
    }

    fun dismissDeleteConfirm() {
        _state.update { it.copy(showDeleteDialog = null) }
    }

    fun saveAddress(
        recipient: String,
        phone: String,
        province: String,
        city: String,
        district: String,
        address: String,
        label: String?,
        postalCode: String?,
        isDefault: Boolean,
    ) {
        val editing = _state.value.editingAddress
        viewModelScope.launch {
            _state.update { it.copy(isSaving = true) }
            try {
                if (editing != null) {
                    addressRepository.update(
                        AddressUpdateRequest(
                            id = editing.id,
                            recipient = recipient,
                            phone = phone,
                            province = province,
                            city = city,
                            district = district,
                            address = address,
                            label = label?.ifBlank { null },
                            postalCode = postalCode?.ifBlank { null },
                            isDefault = isDefault,
                        )
                    )
                } else {
                    addressRepository.create(
                        AddressCreateRequest(
                            recipient = recipient,
                            phone = phone,
                            province = province,
                            city = city,
                            district = district,
                            address = address,
                            label = label?.ifBlank { null },
                            postalCode = postalCode?.ifBlank { null },
                            isDefault = isDefault,
                        )
                    )
                }
                _state.update { it.copy(isSaving = false, showForm = false, editingAddress = null) }
                loadAddresses()
                _event.send(AddressEvent.ShowMessage(if (editing != null) "Address updated" else "Address added"))
            } catch (e: Exception) {
                _state.update { it.copy(isSaving = false) }
                _event.send(AddressEvent.ShowMessage(e.message ?: "Failed to save"))
            }
        }
    }

    fun deleteAddress(id: String) {
        viewModelScope.launch {
            _state.update { it.copy(showDeleteDialog = null) }
            try {
                addressRepository.delete(id)
                loadAddresses()
                _event.send(AddressEvent.ShowMessage("Address deleted"))
            } catch (e: Exception) {
                _event.send(AddressEvent.ShowMessage(e.message ?: "Failed to delete"))
            }
        }
    }

    fun setDefault(id: String) {
        viewModelScope.launch {
            try {
                addressRepository.update(AddressUpdateRequest(id = id, isDefault = true))
                loadAddresses()
            } catch (e: Exception) {
                _event.send(AddressEvent.ShowMessage(e.message ?: "Failed"))
            }
        }
    }
}
