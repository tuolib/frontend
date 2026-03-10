package com.example.shop.core.network

import com.example.shop.core.model.ApiResponse
import com.example.shop.core.storage.TokenStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.Authenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route

class TokenAuthenticator(
    private val tokenStore: TokenStore,
    private val json: Json,
    private val baseUrl: String,
) : Authenticator {

    private val refreshClient = OkHttpClient.Builder().build()
    private val mutex = Mutex()

    override fun authenticate(route: Route?, response: Response): Request? {
        // Avoid infinite retry loops
        if (response.request.header("X-Refresh-Attempted") != null) {
            return null
        }

        return runBlocking {
            mutex.withLock {
                // Check if token was already refreshed by another concurrent request
                val currentToken = tokenStore.accessToken.first()
                val requestToken = response.request.header("Authorization")
                    ?.removePrefix("Bearer ")

                if (currentToken != null && currentToken != requestToken) {
                    return@withLock response.request.newBuilder()
                        .header("Authorization", "Bearer $currentToken")
                        .header("X-Refresh-Attempted", "true")
                        .build()
                }

                val refreshToken = tokenStore.refreshToken.first() ?: run {
                    tokenStore.clear()
                    return@withLock null
                }

                try {
                    val result = performRefresh(refreshToken)
                    if (result != null) {
                        tokenStore.saveTokens(
                            accessToken = result.accessToken,
                            refreshToken = result.refreshToken,
                            accessTokenExpiresAt = result.accessTokenExpiresAt,
                            refreshTokenExpiresAt = result.refreshTokenExpiresAt,
                        )
                        response.request.newBuilder()
                            .header("Authorization", "Bearer ${result.accessToken}")
                            .header("X-Refresh-Attempted", "true")
                            .build()
                    } else {
                        tokenStore.clear()
                        null
                    }
                } catch (_: Exception) {
                    tokenStore.clear()
                    null
                }
            }
        }
    }

    private fun performRefresh(refreshToken: String): RefreshTokenResponse? {
        val body = json.encodeToString(
            RefreshTokenRequest.serializer(),
            RefreshTokenRequest(refreshToken),
        ).toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("${baseUrl.trimEnd('/')}/api/v1/auth/refresh")
            .post(body)
            .build()

        val response = refreshClient.newCall(request).execute()
        if (!response.isSuccessful) return null

        val responseBody = response.body?.string() ?: return null
        val apiResponse = json.decodeFromString<ApiResponse<RefreshTokenResponse>>(responseBody)
        return if (apiResponse.success) apiResponse.data else null
    }
}

@Serializable
private data class RefreshTokenRequest(val refreshToken: String)

@Serializable
private data class RefreshTokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresAt: String,
    val refreshTokenExpiresAt: String,
)
