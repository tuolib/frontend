package com.example.shop.feature.auth.data

import com.example.shop.core.network.requireSuccess
import com.example.shop.core.network.unwrap
import com.example.shop.core.storage.TokenStore
import com.example.shop.feature.auth.data.model.AuthResponse
import com.example.shop.feature.auth.data.model.LoginRequest
import com.example.shop.feature.auth.data.model.LogoutRequest
import com.example.shop.feature.auth.data.model.RegisterRequest
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val tokenStore: TokenStore,
) {
    suspend fun login(email: String, password: String): AuthResponse {
        val response = authApi.login(LoginRequest(email, password)).unwrap()
        saveAuth(response)
        return response
    }

    suspend fun register(email: String, password: String, nickname: String?): AuthResponse {
        val response = authApi.register(RegisterRequest(email, password, nickname)).unwrap()
        saveAuth(response)
        return response
    }

    suspend fun logout() {
        try {
            val refreshToken = tokenStore.refreshToken.first()
            authApi.logout(LogoutRequest(refreshToken)).requireSuccess()
        } catch (_: Exception) {
            // Always clear local tokens even if API call fails
        } finally {
            tokenStore.clear()
        }
    }

    private suspend fun saveAuth(response: AuthResponse) {
        tokenStore.saveTokens(
            accessToken = response.accessToken,
            refreshToken = response.refreshToken,
            accessTokenExpiresAt = response.accessTokenExpiresAt,
            refreshTokenExpiresAt = response.refreshTokenExpiresAt,
        )
    }
}
