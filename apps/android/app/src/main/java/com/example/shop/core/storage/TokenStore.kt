package com.example.shop.core.storage

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenStore @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) {
    val accessToken: Flow<String?> = dataStore.data.map { it[ACCESS_TOKEN_KEY] }
    val refreshToken: Flow<String?> = dataStore.data.map { it[REFRESH_TOKEN_KEY] }
    val isLoggedIn: Flow<Boolean> = dataStore.data.map { it[ACCESS_TOKEN_KEY] != null }
    val accessTokenExpiresAt: Flow<String?> = dataStore.data.map { it[ACCESS_EXPIRES_KEY] }
    val refreshTokenExpiresAt: Flow<String?> = dataStore.data.map { it[REFRESH_EXPIRES_KEY] }

    suspend fun saveTokens(
        accessToken: String,
        refreshToken: String,
        accessTokenExpiresAt: String? = null,
        refreshTokenExpiresAt: String? = null,
    ) {
        dataStore.edit { prefs ->
            prefs[ACCESS_TOKEN_KEY] = accessToken
            prefs[REFRESH_TOKEN_KEY] = refreshToken
            accessTokenExpiresAt?.let { prefs[ACCESS_EXPIRES_KEY] = it }
            refreshTokenExpiresAt?.let { prefs[REFRESH_EXPIRES_KEY] = it }
        }
    }

    /** Token is expiring soon (within 60s) */
    suspend fun isAccessTokenExpiringSoon(): Boolean {
        val expiresAt = dataStore.data.first()[ACCESS_EXPIRES_KEY] ?: return false
        return try {
            val expiryInstant = Instant.parse(expiresAt)
            Instant.now().plusSeconds(60).isAfter(expiryInstant)
        } catch (_: Exception) {
            false
        }
    }

    suspend fun clear() {
        dataStore.edit { it.clear() }
    }

    companion object {
        private val ACCESS_TOKEN_KEY = stringPreferencesKey("access_token")
        private val REFRESH_TOKEN_KEY = stringPreferencesKey("refresh_token")
        private val ACCESS_EXPIRES_KEY = stringPreferencesKey("access_token_expires_at")
        private val REFRESH_EXPIRES_KEY = stringPreferencesKey("refresh_token_expires_at")
    }
}
