package com.example.shop.navigation

import kotlinx.serialization.Serializable

// ── Tab pages (show bottom bar) ──
@Serializable data object HomeRoute
@Serializable data object ProfileRoute
@Serializable data object CartRoute
@Serializable data object MenuRoute

// ── Standalone pages (hide bottom bar) ──
@Serializable data object SearchRoute
@Serializable data class ProductListRoute(
    val categoryId: String? = null,
    val categoryName: String? = null,
)
@Serializable data class ProductDetailRoute(val productId: String)
@Serializable data object OrderCreateRoute
@Serializable data object OrderListRoute
@Serializable data class OrderDetailRoute(val orderId: String)
@Serializable data class PaymentRoute(val orderId: String)
@Serializable data object AddressManageRoute

// ── Auth pages (guest only) ──
@Serializable data object LoginRoute
@Serializable data object RegisterRoute
