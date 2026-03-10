package com.example.shop.core.ui.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.paging.LoadState
import androidx.paging.compose.LazyPagingItems
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.feature.product.data.model.ProductListItem

@Composable
fun ProductGrid(
    items: LazyPagingItems<ProductListItem>,
    onProductClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    columns: Int = 2,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(columns),
        modifier = modifier,
        contentPadding = PaddingValues(horizontal = Dimens.SpacingMd, vertical = Dimens.SpacingSm),
        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
    ) {
        // Loading state
        if (items.loadState.refresh is LoadState.Loading) {
            items(6) {
                ProductCardSkeleton()
            }
            return@LazyVerticalGrid
        }

        items(items.itemCount) { index ->
            val product = items[index]
            if (product != null) {
                ProductCard(
                    product = product,
                    onClick = { onProductClick(product.id) },
                )
            }
        }

        // Append loading indicator
        if (items.loadState.append is LoadState.Loading) {
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
        if (items.loadState.append.endOfPaginationReached && items.itemCount > 0) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        text = "— You've seen it all —",
                        fontSize = 12.sp,
                        color = TextSecondary,
                    )
                }
            }
        }
    }
}
