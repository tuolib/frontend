package com.example.shop.feature.product.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.example.shop.feature.cart.data.CartRepository
import com.example.shop.feature.product.data.ProductRepository
import com.example.shop.feature.product.data.model.ProductDetail
import com.example.shop.feature.product.data.model.Sku
import com.example.shop.feature.product.detail.component.SkuDimension
import com.example.shop.feature.product.detail.component.SkuDimensionValue
import com.example.shop.navigation.ProductDetailRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import javax.inject.Inject

data class ProductDetailUiState(
    val isLoading: Boolean = true,
    val product: ProductDetail? = null,
    val selectedAttributes: Map<String, String> = emptyMap(),
    val matchedSku: Sku? = null,
    val dimensions: List<SkuDimension> = emptyList(),
    val isAddingToCart: Boolean = false,
    val error: String? = null,
)

sealed class ProductDetailEvent {
    data class ShowMessage(val message: String) : ProductDetailEvent()
    data object NavigateToCart : ProductDetailEvent()
}

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<ProductDetailRoute>()
    private val productId = route.productId

    private val _state = MutableStateFlow(ProductDetailUiState())
    val state: StateFlow<ProductDetailUiState> = _state.asStateFlow()

    private val _event = Channel<ProductDetailEvent>()
    val event = _event.receiveAsFlow()

    init {
        loadDetail()
    }

    fun retry() {
        _state.update { it.copy(isLoading = true, error = null) }
        loadDetail()
    }

    private fun loadDetail() {
        viewModelScope.launch {
            try {
                val product = productRepository.detail(productId)
                val activeSkus = product.skus.filter { it.status == "active" }

                // Default select first SKU's attributes
                val defaultAttrs = if (activeSkus.isNotEmpty()) {
                    extractAttributes(activeSkus.first())
                } else {
                    emptyMap()
                }

                val matchedSku = findMatchingSku(activeSkus, defaultAttrs)
                val dimensions = buildDimensions(activeSkus, defaultAttrs)

                _state.update {
                    it.copy(
                        isLoading = false,
                        product = product,
                        selectedAttributes = defaultAttrs,
                        matchedSku = matchedSku,
                        dimensions = dimensions,
                        error = null,
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load product",
                    )
                }
            }
        }
    }

    fun selectAttribute(dimensionName: String, value: String) {
        val product = _state.value.product ?: return
        val activeSkus = product.skus.filter { it.status == "active" }

        val newAttrs = _state.value.selectedAttributes.toMutableMap()
        // Toggle: deselect if already selected
        if (newAttrs[dimensionName] == value) {
            newAttrs.remove(dimensionName)
        } else {
            newAttrs[dimensionName] = value
        }

        val matchedSku = findMatchingSku(activeSkus, newAttrs)
        val dimensions = buildDimensions(activeSkus, newAttrs)

        _state.update {
            it.copy(
                selectedAttributes = newAttrs,
                matchedSku = matchedSku,
                dimensions = dimensions,
            )
        }
    }

    fun addToCart() {
        val sku = _state.value.matchedSku ?: return
        if (sku.stock <= 0) return

        _state.update { it.copy(isAddingToCart = true) }
        viewModelScope.launch {
            try {
                cartRepository.add(sku.id, 1)
                _state.update { it.copy(isAddingToCart = false) }
                _event.send(ProductDetailEvent.ShowMessage("Added to cart"))
            } catch (e: Exception) {
                _state.update { it.copy(isAddingToCart = false) }
                _event.send(ProductDetailEvent.ShowMessage(e.message ?: "Failed to add to cart"))
            }
        }
    }

    fun buyNow() {
        val sku = _state.value.matchedSku ?: return
        if (sku.stock <= 0) return

        _state.update { it.copy(isAddingToCart = true) }
        viewModelScope.launch {
            try {
                cartRepository.add(sku.id, 1)
                _state.update { it.copy(isAddingToCart = false) }
                _event.send(ProductDetailEvent.NavigateToCart)
            } catch (e: Exception) {
                _state.update { it.copy(isAddingToCart = false) }
                _event.send(ProductDetailEvent.ShowMessage(e.message ?: "Failed"))
            }
        }
    }

    private fun extractAttributes(sku: Sku): Map<String, String> {
        return sku.attributes.mapValues { (_, v) -> v.jsonPrimitive.content }
    }

    private fun findMatchingSku(skus: List<Sku>, selected: Map<String, String>): Sku? {
        if (selected.isEmpty()) return null
        return skus.find { sku ->
            val attrs = extractAttributes(sku)
            selected.all { (key, value) -> attrs[key] == value }
        }
    }

    private fun buildDimensions(
        skus: List<Sku>,
        selected: Map<String, String>,
    ): List<SkuDimension> {
        if (skus.isEmpty()) return emptyList()

        // Collect all dimension names and their possible values
        val dimensionMap = linkedMapOf<String, LinkedHashSet<String>>()
        for (sku in skus) {
            for ((key, value) in sku.attributes) {
                dimensionMap.getOrPut(key) { linkedSetOf() }
                    .add(value.jsonPrimitive.content)
            }
        }

        return dimensionMap.map { (name, values) ->
            SkuDimension(
                name = name,
                values = values.map { value ->
                    val isSelected = selected[name] == value
                    // Check if selecting this value would result in any valid SKU
                    val hypothetical = selected.toMutableMap().apply { put(name, value) }
                    val hasValidSku = skus.any { sku ->
                        val attrs = extractAttributes(sku)
                        hypothetical.all { (k, v) -> attrs[k] == v } && sku.stock > 0
                    }
                    SkuDimensionValue(
                        value = value,
                        selected = isSelected,
                        disabled = !hasValidSku && !isSelected,
                    )
                },
            )
        }
    }
}
