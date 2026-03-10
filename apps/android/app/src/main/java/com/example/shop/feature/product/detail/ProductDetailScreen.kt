package com.example.shop.feature.product.detail

import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.shop.core.ui.component.EmptyState
import com.example.shop.core.ui.component.PageHeader
import com.example.shop.core.ui.component.PriceText
import com.example.shop.core.ui.component.RatingBar
import com.example.shop.core.ui.component.SkeletonBox
import com.example.shop.core.ui.theme.CardWhite
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.Orange
import com.example.shop.core.ui.theme.Success
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.feature.product.detail.component.ImageCarousel
import com.example.shop.feature.product.detail.component.SkuSelector

@Composable
fun ProductDetailScreen(
    onBack: () -> Unit,
    onNavigateToCart: () -> Unit,
    viewModel: ProductDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is ProductDetailEvent.ShowMessage -> {
                    snackbarHostState.showSnackbar(event.message)
                }
                is ProductDetailEvent.NavigateToCart -> {
                    onNavigateToCart()
                }
            }
        }
    }

    Scaffold(
        topBar = {
            PageHeader(
                title = state.product?.title ?: "Product Detail",
                onBack = onBack,
                actions = {
                    IconButton(onClick = onNavigateToCart) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = "Cart",
                            tint = TextPrimary,
                        )
                    }
                },
            )
        },
        bottomBar = {
            if (state.product != null) {
                BottomActionBar(
                    matchedSku = state.matchedSku != null,
                    inStock = (state.matchedSku?.stock ?: 0) > 0,
                    isLoading = state.isAddingToCart,
                    onAddToCart = { viewModel.addToCart() },
                    onBuyNow = { viewModel.buyNow() },
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
        ) {
            when {
                state.isLoading -> LoadingSkeleton()
                state.error != null -> {
                    EmptyState(
                        title = "Failed to load product",
                        subtitle = state.error,
                        modifier = Modifier.fillMaxSize(),
                        action = {
                            Button(onClick = { viewModel.retry() }) {
                                Text("Retry")
                            }
                        },
                    )
                }
                state.product != null -> {
                    ProductDetailContent(
                        state = state,
                        onSelectAttribute = viewModel::selectAttribute,
                    )
                }
            }
        }
    }
}

@Composable
private fun ProductDetailContent(
    state: ProductDetailUiState,
    onSelectAttribute: (String, String) -> Unit,
) {
    val product = state.product ?: return
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState),
    ) {
        // Image carousel
        ImageCarousel(
            images = product.images.sortedBy { it.sortOrder },
        )

        // Price section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardWhite)
                .padding(Dimens.SpacingLg),
        ) {
            val displayPrice = state.matchedSku?.price ?: product.minPrice
            val comparePrice = state.matchedSku?.comparePrice

            if (displayPrice != null) {
                PriceText(
                    price = displayPrice,
                    comparePrice = comparePrice,
                    fontSize = 24.sp,
                )
            } else {
                Text(
                    text = "Price unavailable",
                    fontSize = 16.sp,
                    color = TextSecondary,
                )
            }

            // Stock info
            if (state.matchedSku != null) {
                Spacer(modifier = Modifier.height(Dimens.SpacingXs))
                val stock = state.matchedSku.stock
                when {
                    stock <= 0 -> Text(
                        text = "Out of stock",
                        fontSize = 13.sp,
                        color = Color(0xFFB12704),
                        fontWeight = FontWeight.Medium,
                    )
                    stock <= 5 -> Text(
                        text = "Only $stock left in stock",
                        fontSize = 13.sp,
                        color = Color(0xFFB12704),
                        fontWeight = FontWeight.Medium,
                    )
                    else -> Text(
                        text = "In stock",
                        fontSize = 13.sp,
                        color = Success,
                        fontWeight = FontWeight.Medium,
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(Dimens.SpacingSm))

        // Title + Rating
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardWhite)
                .padding(Dimens.SpacingLg),
        ) {
            if (product.brand != null) {
                Text(
                    text = product.brand,
                    fontSize = 13.sp,
                    color = Teal,
                )
                Spacer(modifier = Modifier.height(Dimens.SpacingXs))
            }
            Text(
                text = product.title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary,
                lineHeight = 24.sp,
            )
            Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            Row(
                verticalAlignment = Alignment.CenterVertically,
            ) {
                RatingBar(
                    rating = product.avgRating.toFloatOrNull() ?: 0f,
                    reviewCount = product.reviewCount,
                    starSize = 16.dp,
                )
                if (product.totalSales > 0) {
                    Spacer(modifier = Modifier.width(Dimens.SpacingSm))
                    Text(
                        text = "${product.totalSales}+ bought",
                        fontSize = 12.sp,
                        color = TextSecondary,
                    )
                }
            }
        }

        // SKU selector
        if (state.dimensions.isNotEmpty()) {
            Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CardWhite)
                    .padding(Dimens.SpacingLg),
            ) {
                Text(
                    text = "Options",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary,
                )
                Spacer(modifier = Modifier.height(Dimens.SpacingMd))
                SkuSelector(
                    dimensions = state.dimensions,
                    onSelect = onSelectAttribute,
                )
            }
        }

        // Description
        if (!product.description.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CardWhite)
                    .padding(Dimens.SpacingLg),
            ) {
                Text(
                    text = "About this item",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary,
                )
                Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                Text(
                    text = product.description,
                    fontSize = 14.sp,
                    color = TextSecondary,
                    lineHeight = 22.sp,
                )
            }
        }

        Spacer(modifier = Modifier.height(Dimens.SpacingSm))
    }
}

@Composable
private fun BottomActionBar(
    matchedSku: Boolean,
    inStock: Boolean,
    isLoading: Boolean,
    onAddToCart: () -> Unit,
    onBuyNow: () -> Unit,
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
                .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
            horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingMd),
        ) {
            val enabled = matchedSku && inStock && !isLoading

            OutlinedButton(
                onClick = onAddToCart,
                enabled = enabled,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(Dimens.RadiusMd),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Orange,
                ),
                border = ButtonDefaults.outlinedButtonBorder(enabled).copy(
                    brush = androidx.compose.ui.graphics.SolidColor(
                        if (enabled) Orange else Orange.copy(alpha = 0.3f)
                    ),
                ),
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp,
                        color = Orange,
                    )
                    Spacer(modifier = Modifier.width(Dimens.SpacingSm))
                }
                Text(
                    text = "Add to Cart",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                )
            }

            Button(
                onClick = onBuyNow,
                enabled = enabled,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(Dimens.RadiusMd),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Orange,
                    contentColor = TextPrimary,
                    disabledContainerColor = Orange.copy(alpha = 0.3f),
                    disabledContentColor = TextPrimary.copy(alpha = 0.5f),
                ),
            ) {
                Text(
                    text = "Buy Now",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
    }
}

@Composable
private fun LoadingSkeleton() {
    Column(
        modifier = Modifier.fillMaxSize(),
    ) {
        SkeletonBox(height = 375.dp)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardWhite)
                .padding(Dimens.SpacingLg),
        ) {
            SkeletonBox(width = 120.dp, height = 28.dp)
            Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            SkeletonBox(height = 16.dp)
            Spacer(modifier = Modifier.height(Dimens.SpacingXs))
            SkeletonBox(width = 200.dp, height = 16.dp)
            Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            SkeletonBox(width = 140.dp, height = 14.dp)
        }
        Spacer(modifier = Modifier.height(Dimens.SpacingSm))
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardWhite)
                .padding(Dimens.SpacingLg),
        ) {
            SkeletonBox(width = 80.dp, height = 16.dp)
            Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            Row(horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm)) {
                SkeletonBox(width = 60.dp, height = 32.dp)
                SkeletonBox(width = 60.dp, height = 32.dp)
                SkeletonBox(width = 60.dp, height = 32.dp)
            }
        }
    }
}
