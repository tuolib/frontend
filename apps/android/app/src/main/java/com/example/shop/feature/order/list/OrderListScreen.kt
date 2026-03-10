package com.example.shop.feature.order.list

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
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.LoadState
import androidx.paging.compose.collectAsLazyPagingItems
import coil3.compose.AsyncImage
import com.example.shop.core.ui.component.EmptyState
import com.example.shop.core.ui.component.PageHeader
import com.example.shop.core.ui.theme.BackgroundGray
import com.example.shop.core.ui.theme.CardWhite
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.PriceRed
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.core.util.DateFormatter
import com.example.shop.core.util.PriceFormatter
import com.example.shop.feature.order.data.model.OrderListItem

@Composable
fun OrderListScreen(
    onBack: () -> Unit,
    onOrderClick: (String) -> Unit,
    viewModel: OrderListViewModel = hiltViewModel(),
) {
    val selectedTabIndex by viewModel.selectedTabIndex.collectAsStateWithLifecycle()
    val orders = viewModel.orders.collectAsLazyPagingItems()

    Scaffold(
        topBar = { PageHeader(title = "My Orders", onBack = onBack) },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(BackgroundGray),
        ) {
            // Status tabs
            ScrollableTabRow(
                selectedTabIndex = selectedTabIndex,
                containerColor = CardWhite,
                contentColor = TextPrimary,
                edgePadding = 0.dp,
                indicator = { tabPositions ->
                    if (selectedTabIndex < tabPositions.size) {
                        TabRowDefaults.SecondaryIndicator(
                            modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTabIndex]),
                            color = Teal,
                        )
                    }
                },
                divider = { HorizontalDivider(color = Divider) },
            ) {
                ORDER_TABS.forEachIndexed { index, tab ->
                    Tab(
                        selected = selectedTabIndex == index,
                        onClick = { viewModel.selectTab(index) },
                        text = {
                            Text(
                                text = tab.label,
                                fontSize = 14.sp,
                                fontWeight = if (selectedTabIndex == index) FontWeight.SemiBold else FontWeight.Normal,
                                color = if (selectedTabIndex == index) Teal else TextSecondary,
                            )
                        },
                    )
                }
            }

            // Order list
            when (val refreshState = orders.loadState.refresh) {
                is LoadState.Loading -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Teal)
                    }
                }
                is LoadState.Error -> {
                    EmptyState(
                        title = "Failed to load orders",
                        subtitle = refreshState.error.message,
                        modifier = Modifier.fillMaxSize(),
                    )
                }
                else -> {
                    if (orders.itemCount == 0) {
                        EmptyState(
                            title = "No orders yet",
                            subtitle = "Your orders will appear here",
                            icon = Icons.Outlined.Receipt,
                            modifier = Modifier.fillMaxSize(),
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                        ) {
                            item { Spacer(Modifier.height(Dimens.SpacingSm)) }
                            items(
                                count = orders.itemCount,
                                key = { orders[it]?.orderId ?: it },
                            ) { index ->
                                orders[index]?.let { order ->
                                    OrderCard(
                                        order = order,
                                        onClick = { onOrderClick(order.orderId) },
                                    )
                                }
                            }
                            if (orders.loadState.append is LoadState.Loading) {
                                item {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(Dimens.SpacingLg),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        CircularProgressIndicator(
                                            color = Teal,
                                            modifier = Modifier.size(24.dp),
                                        )
                                    }
                                }
                            }
                            item { Spacer(Modifier.height(Dimens.SpacingSm)) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun OrderCard(
    order: OrderListItem,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .clickable(onClick = onClick)
            .padding(Dimens.SpacingLg),
    ) {
        // Header: order no + status
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "#${order.orderNo}",
                fontSize = 13.sp,
                color = TextSecondary,
            )
            StatusBadge(status = order.status)
        }

        Spacer(Modifier.height(Dimens.SpacingMd))

        // Product info
        order.firstItem?.let { item ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(Dimens.RadiusSm)),
                    contentScale = ContentScale.Crop,
                )
                Spacer(Modifier.width(Dimens.SpacingMd))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.productTitle,
                        fontSize = 14.sp,
                        color = TextPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    if (order.itemCount > 1) {
                        Text(
                            text = "${order.itemCount} items",
                            fontSize = 12.sp,
                            color = TextSecondary,
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(Dimens.SpacingMd))
        HorizontalDivider(color = Divider)
        Spacer(Modifier.height(Dimens.SpacingSm))

        // Footer: total + date
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = DateFormatter.formatDateTime(order.createdAt),
                fontSize = 12.sp,
                color = TextSecondary,
            )
            Text(
                text = "¥${PriceFormatter.format(order.payAmount)}",
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = PriceRed,
            )
        }
    }
}

@Composable
fun StatusBadge(status: String) {
    val (text, textColor, bgColor) = getStatusStyle(status)
    Text(
        text = text,
        fontSize = 12.sp,
        fontWeight = FontWeight.Medium,
        color = textColor,
        modifier = Modifier
            .background(bgColor, RoundedCornerShape(Dimens.RadiusSm))
            .padding(horizontal = Dimens.SpacingSm, vertical = Dimens.SpacingXs),
    )
}

private fun getStatusStyle(status: String): Triple<String, Color, Color> {
    return when (status) {
        "pending" -> Triple("Pending Payment", Color(0xFFB12704), Color(0xFFFEF0E5))
        "paid" -> Triple("Paid", Color(0xFF067D62), Color(0xFFE6F5F0))
        "shipped" -> Triple("Shipped", Color(0xFF146EB4), Color(0xFFE8F0FE))
        "delivered" -> Triple("Delivered", Color(0xFF007185), Color(0xFFE0F4F7))
        "completed" -> Triple("Completed", Color(0xFF067D62), Color(0xFFE6F5F0))
        "cancelled" -> Triple("Cancelled", Color(0xFF565959), Color(0xFFF0F0F0))
        "refunded" -> Triple("Refunded", Color(0xFFC45500), Color(0xFFFEF5EC))
        else -> Triple(status.replaceFirstChar { it.uppercase() }, Color(0xFF565959), Color(0xFFF0F0F0))
    }
}
