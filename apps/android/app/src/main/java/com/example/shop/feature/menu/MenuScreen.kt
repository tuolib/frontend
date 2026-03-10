package com.example.shop.feature.menu

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.PriceRed
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.core.util.PriceFormatter
import com.example.shop.feature.menu.data.model.CategoryNode
import com.example.shop.feature.product.data.model.ProductListItem

@Composable
fun MenuScreen(
    onCategoryClick: (categoryId: String, categoryName: String) -> Unit,
    onProductClick: ((productId: String) -> Unit)? = null,
    viewModel: MenuViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    if (state.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator(color = Teal)
        }
        return
    }

    if (state.categories.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "No categories",
                fontSize = 16.sp,
                color = TextSecondary,
            )
        }
        return
    }

    Row(modifier = Modifier.fillMaxSize()) {
        // Left: primary category list
        LazyColumn(
            modifier = Modifier
                .width(88.dp)
                .fillMaxHeight()
                .background(Color(0xFFF5F5F5)),
        ) {
            itemsIndexed(state.categories) { index, category ->
                val isSelected = index == state.selectedIndex
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.onSelectCategory(index) }
                        .background(if (isSelected) Color.White else Color.Transparent),
                ) {
                    // Left teal indicator
                    if (isSelected) {
                        Box(
                            modifier = Modifier
                                .width(3.dp)
                                .height(40.dp)
                                .background(Teal)
                                .align(Alignment.CenterStart),
                        )
                    }

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = Dimens.SpacingMd, horizontal = Dimens.SpacingXs),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        // Emoji icon
                        val emoji = CategoryEmoji.get(category.slug)
                        if (emoji != null) {
                            Text(
                                text = emoji,
                                fontSize = 22.sp,
                            )
                            Spacer(Modifier.height(Dimens.SpacingXs))
                        }

                        Text(
                            text = category.name,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) TextPrimary else TextSecondary,
                            textAlign = TextAlign.Center,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }

        // Right: subcategories grid + popular products
        val selectedCategory = state.categories.getOrNull(state.selectedIndex)

        if (selectedCategory != null) {
            RightPanel(
                category = selectedCategory,
                popularProducts = state.popularProducts,
                popularLoading = state.popularLoading,
                onCategoryClick = onCategoryClick,
                onProductClick = onProductClick,
            )
        }
    }
}

@Composable
private fun RightPanel(
    category: CategoryNode,
    popularProducts: List<ProductListItem>,
    popularLoading: Boolean,
    onCategoryClick: (String, String) -> Unit,
    onProductClick: ((String) -> Unit)?,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(3),
        modifier = Modifier
            .fillMaxHeight()
            .background(Color.White)
            .padding(horizontal = Dimens.SpacingMd),
        contentPadding = PaddingValues(vertical = Dimens.SpacingMd),
        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpacingLg),
    ) {
        // Subcategory items
        if (category.children.isNotEmpty()) {
            items(category.children) { child ->
                SubcategoryItem(
                    category = child,
                    onClick = { onCategoryClick(child.id, child.name) },
                )
            }
        }

        // Popular products section
        item(span = { GridItemSpan(3) }) {
            PopularSection(
                products = popularProducts,
                isLoading = popularLoading,
                onProductClick = onProductClick,
            )
        }

        // "See all" button
        item(span = { GridItemSpan(3) }) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(Dimens.RadiusMd))
                    .background(Color(0xFFF5F5F5))
                    .clickable { onCategoryClick(category.id, category.name) }
                    .padding(Dimens.SpacingMd),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "See all ${category.name}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Teal,
                )
                Spacer(modifier = Modifier.width(Dimens.SpacingXs))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Teal,
                )
            }
        }
    }
}

@Composable
private fun PopularSection(
    products: List<ProductListItem>,
    isLoading: Boolean,
    onProductClick: ((String) -> Unit)?,
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Spacer(Modifier.height(Dimens.SpacingSm))

        Text(
            text = "Popular",
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
        )

        Spacer(Modifier.height(Dimens.SpacingSm))

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(color = Teal, modifier = Modifier.size(20.dp))
            }
        } else if (products.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = Dimens.SpacingLg),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "No products yet",
                    fontSize = 13.sp,
                    color = TextSecondary,
                )
            }
        } else {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
            ) {
                products.forEach { product ->
                    PopularProductItem(
                        product = product,
                        onClick = { onProductClick?.invoke(product.id) },
                    )
                }
            }
        }

        Spacer(Modifier.height(Dimens.SpacingSm))
    }
}

@Composable
private fun PopularProductItem(
    product: ProductListItem,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .width(100.dp)
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .clickable(onClick = onClick)
            .padding(Dimens.SpacingXs),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        AsyncImage(
            model = product.primaryImage,
            contentDescription = product.title,
            modifier = Modifier
                .size(80.dp)
                .clip(RoundedCornerShape(Dimens.RadiusMd))
                .background(Color(0xFFF5F5F5)),
            contentScale = ContentScale.Crop,
        )

        Spacer(Modifier.height(Dimens.SpacingXs))

        Text(
            text = product.title,
            fontSize = 11.sp,
            color = TextPrimary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            textAlign = TextAlign.Center,
        )

        product.minPrice?.let { price ->
            Text(
                text = "¥${PriceFormatter.format(price)}",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = PriceRed,
            )
        }
    }
}

@Composable
private fun SubcategoryItem(
    category: CategoryNode,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .clickable(onClick = onClick)
            .padding(Dimens.SpacingXs),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        val emoji = CategoryEmoji.get(category.slug)
        if (emoji != null) {
            // Emoji icon in circle
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF0F0F0)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = emoji,
                    fontSize = 24.sp,
                )
            }
        } else if (category.iconUrl != null) {
            AsyncImage(
                model = category.iconUrl,
                contentDescription = category.name,
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop,
            )
        } else {
            // Fallback: first letter
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF0F0F0)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = category.name.take(1),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Teal,
                )
            }
        }

        Spacer(modifier = Modifier.height(Dimens.SpacingXs))

        Text(
            text = category.name,
            fontSize = 12.sp,
            color = TextPrimary,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
