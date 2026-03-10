package com.example.shop.feature.auth.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.shop.core.network.ApiError
import com.example.shop.core.util.isValidEmail
import com.example.shop.core.util.isValidPassword
import com.example.shop.feature.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RegisterUiState(
    val email: String = "",
    val password: String = "",
    val nickname: String = "",
    val emailError: String? = null,
    val passwordError: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
)

sealed interface RegisterEvent {
    data object RegisterSuccess : RegisterEvent
}

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RegisterUiState())
    val state: StateFlow<RegisterUiState> = _state.asStateFlow()

    private val _event = Channel<RegisterEvent>()
    val event = _event.receiveAsFlow()

    fun updateEmail(email: String) {
        _state.update { it.copy(email = email, emailError = null, error = null) }
    }

    fun updatePassword(password: String) {
        _state.update { it.copy(password = password, passwordError = null, error = null) }
    }

    fun updateNickname(nickname: String) {
        _state.update { it.copy(nickname = nickname, error = null) }
    }

    fun register() {
        val current = _state.value

        // Validate
        var hasError = false
        if (!current.email.isValidEmail()) {
            _state.update { it.copy(emailError = "Please enter a valid email") }
            hasError = true
        }
        if (!current.password.isValidPassword()) {
            _state.update { it.copy(passwordError = "Password must be at least 8 characters") }
            hasError = true
        }
        if (hasError) return

        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            try {
                authRepository.register(
                    email = current.email.trim(),
                    password = current.password,
                    nickname = current.nickname.trim().ifBlank { null },
                )
                _event.send(RegisterEvent.RegisterSuccess)
            } catch (e: ApiError) {
                _state.update { it.copy(isLoading = false, error = e.message) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = "Network error, please try again") }
            }
        }
    }
}
