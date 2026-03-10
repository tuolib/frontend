package com.example.shop.core.network

import okhttp3.Interceptor
import okhttp3.Response
import java.util.UUID

/**
 * Injects X-Idempotency-Key header for order/payment creation requests.
 */
class IdempotencyInterceptor : Interceptor {

    private val idempotentPaths = setOf(
        "/api/v1/order/create",
        "/api/v1/payment/create",
    )

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath

        return if (path in idempotentPaths) {
            chain.proceed(
                request.newBuilder()
                    .header("X-Idempotency-Key", UUID.randomUUID().toString())
                    .build()
            )
        } else {
            chain.proceed(request)
        }
    }
}
