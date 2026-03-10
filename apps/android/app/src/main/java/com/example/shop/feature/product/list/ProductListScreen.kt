package com.example.shop.feature.product.list

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.LoadState
import androidx.paging.compose.collectAsLazyPagingItems
import com.example.shop.core.ui.component.EmptyState
import com.example.shop.core.ui.component.ProductGrid
import com.example.shop.core.ui.component.SortBar
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.TextPrimary

@Composable
fun ProductListScreen(
    onBack: () -> Unit,
    onProductClick: (String) -> Unit,
    viewModel: ProductListViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val products = viewModel.products.collectAsLazyPagingItems()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5)),
    ) {
        // Top bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(Dimens.PageHeaderHeight)
                .background(Color.White)
                .padding(horizontal = Dimens.SpacingXs),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = TextPrimary,
                )
            }
            Text(
                text = state.categoryName ?: "Products",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
            )
        }

        // Divider
        Spacer(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Divider),
        )

        // Sort bar
        SortBar(
            currentSort = state.sort,
            currentOrder = state.order,
            onSortChange = viewModel::onSortChange,
        )

        Spacer(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Divider),
        )

        // Product grid
        val isEmpty = products.loadState.refresh is LoadState.NotLoading &&
                products.itemCount == 0

        if (isEmpty) {
            EmptyState(
                title = "No products found",
                subtitle = "Try a different category",
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            ProductGrid(
                items = products,
                onProductClick = onProductClick,
                modifier = Modifier.fillMaxSize(),
            )
        }
    }
}
