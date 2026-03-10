package com.example.shop.feature.cart

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.example.shop.core.ui.component.EmptyState
import com.example.shop.core.ui.component.LoadingButton
import com.example.shop.core.ui.component.QuantityStepper
import com.example.shop.core.ui.theme.BackgroundGray
import com.example.shop.core.ui.theme.CardWhite
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.Orange
import com.example.shop.core.ui.theme.PriceRed
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.core.util.PriceFormatter
import com.example.shop.feature.cart.data.model.CartItem
import kotlinx.serialization.json.jsonPrimitive

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToCheckout: () -> Unit,
    onNavigateToProduct: (String) -> Unit,
    viewModel: CartViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val lifecycleOwner = LocalLifecycleOwner.current

    // Refresh cart data every time the screen becomes visible (e.g. after adding items)
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            viewModel.refresh()
        }
    }

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is CartEvent.ShowMessage -> snackbarHostState.showSnackbar(event.message)
                is CartEvent.NavigateToLogin -> onNavigateToLogin()
                is CartEvent.NavigateToCheckout -> onNavigateToCheckout()
            }
        }
    }

    Scaffold(
        topBar = {
            CartTopBar(itemCount = state.items.size)
        },
        bottomBar = {
            if (state.isLoggedIn && state.items.isNotEmpty()) {
                CartBottomBar(
                    isAllSelected = state.isAllSelected,
                    onToggleSelectAll = { viewModel.toggleSelectAll() },
                    selectedCount = state.selectedCount,
                    subtotal = state.subtotal,
                    onCheckout = { viewModel.checkout() },
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(BackgroundGray),
        ) {
            when {
                state.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator(color = Teal)
                    }
                }
                !state.isLoggedIn -> {
                    EmptyState(
                        title = "Sign in to view your cart",
                        subtitle = "Shop for the best deals",
                        icon = Icons.Outlined.ShoppingCart,
                        modifier = Modifier.fillMaxSize(),
                        action = {
                            LoadingButton(
                                text = "Sign In",
                                onClick = { viewModel.goToLogin() },
                                modifier = Modifier.width(200.dp),
                            )
                        },
                    )
                }
                state.items.isEmpty() -> {
                    EmptyState(
                        title = "Your cart is empty",
                        subtitle = "Browse products and add items to your cart",
                        icon = Icons.Outlined.ShoppingCart,
                        modifier = Modifier.fillMaxSize(),
                    )
                }
                else -> {
                    PullToRefreshBox(
                        isRefreshing = false,
                        onRefresh = { viewModel.refresh() },
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                        ) {
                            item { Spacer(modifier = Modifier.height(Dimens.SpacingSm)) }
                            items(
                                items = state.items,
                                key = { it.skuId },
                            ) { item ->
                                CartItemRow(
                                    item = item,
                                    onToggleSelect = { viewModel.toggleSelect(item.skuId) },
                                    onQuantityChange = { qty -> viewModel.updateQuantity(item.skuId, qty) },
                                    onRemove = { viewModel.removeItem(item.skuId) },
                                    onProductClick = { onNavigateToProduct(item.productId) },
                                )
                            }
                            item { Spacer(modifier = Modifier.height(Dimens.SpacingSm)) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CartTopBar(itemCount: Int) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(Dimens.PageHeaderHeight)
                .padding(horizontal = Dimens.SpacingLg),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = if (itemCount > 0) "Shopping Cart ($itemCount)" else "Shopping Cart",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
            )
        }
        HorizontalDivider(thickness = 1.dp, color = Divider)
    }
}

@Composable
private fun CartItemRow(
    item: CartItem,
    onToggleSelect: () -> Unit,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit,
    onProductClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(vertical = Dimens.SpacingMd, horizontal = Dimens.SpacingSm),
        verticalAlignment = Alignment.Top,
    ) {
        // Checkbox
        Checkbox(
            checked = item.selected,
            onCheckedChange = { onToggleSelect() },
            colors = CheckboxDefaults.colors(
                checkedColor = Teal,
            ),
        )

        // Image
        AsyncImage(
            model = item.imageUrl,
            contentDescription = item.productTitle,
            modifier = Modifier
                .size(88.dp)
                .clip(RoundedCornerShape(Dimens.RadiusSm))
                .clickable(onClick = onProductClick),
            contentScale = ContentScale.Crop,
        )

        Spacer(modifier = Modifier.width(Dimens.SpacingMd))

        // Details
        Column(
            modifier = Modifier.weight(1f),
        ) {
            Text(
                text = item.productTitle,
                fontSize = 14.sp,
                color = TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.clickable(onClick = onProductClick),
            )

            // SKU attributes
            val attrs = item.attributes.entries
                .map { (_, v) -> v.jsonPrimitive.content }
                .joinToString(" · ")
            if (attrs.isNotEmpty()) {
                Spacer(modifier = Modifier.height(Dimens.SpacingXs))
                Text(
                    text = attrs,
                    fontSize = 12.sp,
                    color = TextSecondary,
                )
            }

            Spacer(modifier = Modifier.height(Dimens.SpacingSm))

            // Price
            Text(
                text = "¥${PriceFormatter.format(item.price)}",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = PriceRed,
            )

            Spacer(modifier = Modifier.height(Dimens.SpacingSm))

            // Quantity + Delete
            Row(
                verticalAlignment = Alignment.CenterVertically,
            ) {
                QuantityStepper(
                    quantity = item.quantity,
                    onQuantityChange = onQuantityChange,
                    maxQuantity = minOf(99, item.stock),
                )
                Spacer(modifier = Modifier.weight(1f))
                IconButton(
                    onClick = onRemove,
                    modifier = Modifier.size(32.dp),
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Remove",
                        modifier = Modifier.size(18.dp),
                        tint = TextSecondary,
                    )
                }
            }
        }
    }
}

@Composable
private fun CartBottomBar(
    isAllSelected: Boolean,
    onToggleSelectAll: () -> Unit,
    selectedCount: Int,
    subtotal: Double,
    onCheckout: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite),
    ) {
        HorizontalDivider(thickness = 1.dp, color = Divider)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Dimens.SpacingSm, vertical = Dimens.SpacingSm),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Checkbox(
                checked = isAllSelected,
                onCheckedChange = { onToggleSelectAll() },
                colors = CheckboxDefaults.colors(
                    checkedColor = Teal,
                ),
            )
            Text(
                text = "All",
                fontSize = 14.sp,
                color = TextPrimary,
            )
            Spacer(modifier = Modifier.weight(1f))
            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.padding(end = Dimens.SpacingSm),
            ) {
                Text(
                    text = "Subtotal: ¥${PriceFormatter.format(subtotal)}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PriceRed,
                )
                if (selectedCount > 0) {
                    Text(
                        text = "$selectedCount item${if (selectedCount > 1) "s" else ""}",
                        fontSize = 12.sp,
                        color = TextSecondary,
                    )
                }
            }
            Spacer(modifier = Modifier.width(Dimens.SpacingSm))
            Button(
                onClick = onCheckout,
                enabled = selectedCount > 0,
                shape = RoundedCornerShape(Dimens.RadiusMd),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Orange,
                    contentColor = TextPrimary,
                    disabledContainerColor = Orange.copy(alpha = 0.3f),
                    disabledContentColor = TextPrimary.copy(alpha = 0.5f),
                ),
                modifier = Modifier.height(40.dp),
            ) {
                Text(
                    text = "Checkout",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
    }
}
