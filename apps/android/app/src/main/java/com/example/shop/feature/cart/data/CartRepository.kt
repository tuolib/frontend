package com.example.shop.feature.cart.data

import com.example.shop.core.network.requireSuccess
import com.example.shop.core.network.unwrap
import com.example.shop.feature.cart.data.model.CartAddRequest
import com.example.shop.feature.cart.data.model.CartItem
import com.example.shop.feature.cart.data.model.CartRemoveRequest
import com.example.shop.feature.cart.data.model.CartSelectRequest
import com.example.shop.feature.cart.data.model.CartUpdateRequest
import com.example.shop.feature.cart.data.model.CheckoutPreview
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartRepository @Inject constructor(
    private val api: CartApi,
) {
    suspend fun list(): List<CartItem> {
        return api.list().unwrap()
    }

    suspend fun add(skuId: String, quantity: Int) {
        api.add(CartAddRequest(skuId, quantity)).requireSuccess()
    }

    suspend fun update(skuId: String, quantity: Int) {
        api.update(CartUpdateRequest(skuId, quantity)).requireSuccess()
    }

    suspend fun remove(skuIds: List<String>) {
        api.remove(CartRemoveRequest(skuIds)).requireSuccess()
    }

    suspend fun select(skuIds: List<String>, selected: Boolean) {
        api.select(CartSelectRequest(skuIds, selected)).requireSuccess()
    }

    suspend fun checkoutPreview(): CheckoutPreview {
        return api.checkoutPreview().unwrap()
    }
}
