package com.example.shop.feature.home

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.LoadState
import androidx.paging.compose.collectAsLazyPagingItems
import com.example.shop.core.ui.component.BannerSkeleton
import com.example.shop.core.ui.component.CategoryPillsSkeleton
import com.example.shop.core.ui.component.HorizontalCardsSkeleton
import com.example.shop.core.ui.component.ProductCard
import com.example.shop.core.ui.component.ProductCardSkeleton
import com.example.shop.core.ui.theme.DarkNavy
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.feature.home.component.BannerCarousel
import com.example.shop.feature.home.component.CategoryPills
import com.example.shop.feature.home.component.CategoryShowcase
import com.example.shop.feature.home.component.DealSection
import com.example.shop.feature.home.component.NewArrivalsSection
import com.example.shop.feature.home.component.TopRatedSection
import com.example.shop.navigation.ProductDetailRoute
import com.example.shop.navigation.ProductListRoute
import com.example.shop.navigation.SearchRoute

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigate: (Any) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val recommendedItems = viewModel.recommendedProducts.collectAsLazyPagingItems()

    PullToRefreshBox(
        isRefreshing = state.isRefreshing,
        onRefresh = { viewModel.refresh() },
        modifier = Modifier.fillMaxSize(),
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
        ) {
            // ── Search bar ──
            item {
                SearchBar(onClick = { onNavigate(SearchRoute) })
            }

            if (state.isLoading) {
                // Skeleton loading
                item { Spacer(modifier = Modifier.height(Dimens.SpacingSm)) }
                item { CategoryPillsSkeleton() }
                item { Spacer(modifier = Modifier.height(Dimens.SpacingSm)) }
                item {
                    BannerSkeleton(
                        modifier = Modifier.padding(horizontal = Dimens.SpacingMd)
                    )
                }
                item { Spacer(modifier = Modifier.height(Dimens.SpacingSm)) }
                item { HorizontalCardsSkeleton() }
                return@LazyColumn
            }

            // ── Category pills ──
            if (state.categories.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                    CategoryPills(
                        categories = state.categories,
                        onCategoryClick = { category ->
                            onNavigate(
                                ProductListRoute(
                                    categoryId = category.id,
                                    categoryName = category.name,
                                )
                            )
                        },
                    )
                }
            }

            // ── Banner carousel ──
            if (state.banners.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                    BannerCarousel(
                        banners = state.banners,
                        onBannerClick = { banner ->
                            when (banner.linkType) {
                                "product" -> banner.linkValue?.let {
                                    onNavigate(ProductDetailRoute(it))
                                }
                                "category" -> banner.linkValue?.let {
                                    onNavigate(
                                        ProductListRoute(categoryId = it)
                                    )
                                }
                            }
                        },
                    )
                }
            }

            // ── Promo banner: Free shipping ──
            item {
                Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                PromoBanner(
                    icon = Icons.Default.LocalShipping,
                    text = "Free shipping on orders over ¥99",
                    gradientColors = listOf(
                        DarkNavy,
                        Color(0xFF232F3E),
                    ),
                )
            }

            // ── Deal of the Day ──
            if (state.dealItems.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                    DealSection(
                        items = state.dealItems,
                        onProductClick = { id -> onNavigate(ProductDetailRoute(id)) },
                    )
                }
            }

            // ── Category showcase ──
            if (state.categoryShowcases.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                    CategoryShowcase(
                        showcases = state.categoryShowcases,
                        onCategoryClick = { category ->
                            onNavigate(
                                ProductListRoute(
                                    categoryId = category.id,
                                    categoryName = category.name,
                                )
                            )
                        },
                        onProductClick = { id -> onNavigate(ProductDetailRoute(id)) },
                    )
                }
            }

            // ── New Arrivals ──
            if (state.newArrivals.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                    NewArrivalsSection(
                        items = state.newArrivals,
                        onProductClick = { id -> onNavigate(ProductDetailRoute(id)) },
                    )
                }
            }

            // ── Promo banner: Returns ──
            item {
                Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                PromoBanner(
                    icon = Icons.AutoMirrored.Filled.Undo,
                    text = "30-day hassle-free returns",
                    gradientColors = listOf(
                        Teal,
                        Color(0xFF00897B),
                    ),
                )
            }

            // ── Top Rated ──
            if (state.topRated.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                    TopRatedSection(
                        items = state.topRated,
                        onProductClick = { id -> onNavigate(ProductDetailRoute(id)) },
                    )
                }
            }

            // ── Recommended for You ──
            item {
                Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                Text(
                    text = "Recommended for You",
                    modifier = Modifier.padding(horizontal = Dimens.SpacingMd),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = com.example.shop.core.ui.theme.TextPrimary,
                )
                Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            }

            // Recommended products grid (inline in LazyColumn to avoid nested scrolling)
            val itemCount = recommendedItems.itemCount
            val rowCount = (itemCount + 1) / 2
            items(rowCount) { rowIndex ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(
                            start = Dimens.SpacingMd,
                            end = Dimens.SpacingMd,
                            bottom = Dimens.SpacingSm,
                        ),
                    horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                ) {
                    val firstIndex = rowIndex * 2
                    val product1 = recommendedItems[firstIndex]
                    if (product1 != null) {
                        ProductCard(
                            product = product1,
                            onClick = { onNavigate(ProductDetailRoute(product1.id)) },
                            modifier = Modifier.weight(1f),
                        )
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }

                    val secondIndex = firstIndex + 1
                    if (secondIndex < itemCount) {
                        val product2 = recommendedItems[secondIndex]
                        if (product2 != null) {
                            ProductCard(
                                product = product2,
                                onClick = { onNavigate(ProductDetailRoute(product2.id)) },
                                modifier = Modifier.weight(1f),
                            )
                        } else {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            // Recommended loading/skeleton
            if (recommendedItems.loadState.refresh is LoadState.Loading) {
                items(3) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = Dimens.SpacingMd),
                        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                    ) {
                        ProductCardSkeleton(modifier = Modifier.weight(1f))
                        ProductCardSkeleton(modifier = Modifier.weight(1f))
                    }
                }
            }

            // Append loading
            if (recommendedItems.loadState.append is LoadState.Loading) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp,
                            color = Teal,
                        )
                    }
                }
            }

            // End of list
            if (recommendedItems.loadState.append.endOfPaginationReached && itemCount > 0) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = "— You've seen it all —",
                            fontSize = 12.sp,
                            color = TextSecondary,
                        )
                    }
                }
            }

            // Bottom spacing
            item { Spacer(modifier = Modifier.height(Dimens.SpacingSm)) }
        }
    }
}

@Composable
private fun SearchBar(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkNavy)
            .padding(horizontal = Dimens.SpacingMd, vertical = Dimens.SpacingSm),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(Dimens.RadiusMd))
                .background(Color.White)
                .clickable(onClick = onClick)
                .padding(horizontal = Dimens.SpacingMd, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search",
                modifier = Modifier.size(20.dp),
                tint = Teal,
            )
            Spacer(modifier = Modifier.width(Dimens.SpacingSm))
            Text(
                text = "Search products...",
                fontSize = 14.sp,
                color = TextSecondary,
            )
        }
    }
}

@Composable
private fun PromoBanner(
    icon: ImageVector,
    text: String,
    gradientColors: List<Color>,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.SpacingMd)
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .background(Brush.horizontalGradient(gradientColors))
            .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(24.dp),
            tint = Color.White,
        )
        Spacer(modifier = Modifier.width(Dimens.SpacingSm))
        Text(
            text = text,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White,
        )
    }
}
