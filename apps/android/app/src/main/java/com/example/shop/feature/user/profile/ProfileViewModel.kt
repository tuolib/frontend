package com.example.shop.feature.user.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.shop.core.storage.TokenStore
import com.example.shop.feature.auth.data.AuthRepository
import com.example.shop.feature.auth.data.model.User
import com.example.shop.feature.order.data.OrderRepository
import com.example.shop.feature.order.data.model.OrderListItem
import com.example.shop.feature.user.data.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val recentOrders: List<OrderListItem> = emptyList(),
    val ordersLoading: Boolean = false,
    val error: String? = null,
)

sealed interface ProfileEvent {
    data object LogoutSuccess : ProfileEvent
    data class ShowError(val message: String) : ProfileEvent
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val orderRepository: OrderRepository,
    private val authRepository: AuthRepository,
    tokenStore: TokenStore,
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileUiState())
    val state: StateFlow<ProfileUiState> = _state.asStateFlow()

    private val _event = Channel<ProfileEvent>()
    val event = _event.receiveAsFlow()

    val isLoggedIn: StateFlow<Boolean> = tokenStore.isLoggedIn
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    fun loadProfile() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            try {
                val user = userRepository.profile()
                _state.update { it.copy(isLoading = false, user = user) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun loadRecentOrders() {
        viewModelScope.launch {
            _state.update { it.copy(ordersLoading = true) }
            try {
                val result = orderRepository.list(page = 1, pageSize = 3)
                _state.update { it.copy(ordersLoading = false, recentOrders = result.items) }
            } catch (_: Exception) {
                _state.update { it.copy(ordersLoading = false) }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                authRepository.logout()
                _state.update { ProfileUiState() }
                _event.send(ProfileEvent.LogoutSuccess)
            } catch (e: Exception) {
                _event.send(ProfileEvent.ShowError(e.message ?: "Logout failed"))
            }
        }
    }
}
