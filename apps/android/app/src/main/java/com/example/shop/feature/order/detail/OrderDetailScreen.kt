package com.example.shop.feature.order.detail

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.example.shop.core.ui.component.PageHeader
import com.example.shop.core.ui.theme.BackgroundGray
import com.example.shop.core.ui.theme.CardWhite
import com.example.shop.core.ui.theme.DarkNavy
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.Orange
import com.example.shop.core.ui.theme.PriceRed
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.core.util.DateFormatter
import com.example.shop.core.util.PriceFormatter
import com.example.shop.feature.order.data.model.OrderAddressData
import com.example.shop.feature.order.data.model.OrderDetailResult
import com.example.shop.feature.order.data.model.OrderItemData
import com.example.shop.feature.order.data.model.OrderStatus
import com.example.shop.feature.order.list.StatusBadge
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun OrderDetailScreen(
    onBack: () -> Unit,
    onNavigateToPayment: (String) -> Unit,
    viewModel: OrderDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is OrderDetailEvent.ShowMessage -> snackbarHostState.showSnackbar(event.message)
                is OrderDetailEvent.NavigateToPayment -> onNavigateToPayment(event.orderId)
                is OrderDetailEvent.NavigateBack -> onBack()
            }
        }
    }

    Scaffold(
        topBar = { PageHeader(title = "Order Detail", onBack = onBack) },
        bottomBar = {
            state.order?.let { order ->
                OrderDetailBottomBar(
                    status = order.status,
                    onCancel = { viewModel.showCancelDialog() },
                    onPay = { viewModel.goToPayment() },
                    isCancelling = state.isCancelling,
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
            if (state.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Teal)
                }
            } else if (state.order != null) {
                val order = state.order!!
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                ) {
                    // Status banner
                    item { StatusBanner(order.status) }

                    // Address
                    order.address?.let { addr ->
                        item { AddressSection(addr) }
                    }

                    // Items header
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(CardWhite)
                                .padding(Dimens.SpacingLg),
                        ) {
                            Text(
                                text = "Items (${order.items.size})",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary,
                            )
                        }
                    }

                    // Item rows
                    items(order.items) { item ->
                        OrderItemRow(item)
                    }

                    // Summary
                    item { OrderSummary(order) }

                    // Order info
                    item { OrderInfo(order) }

                    // Remark
                    if (!order.remark.isNullOrBlank()) {
                        item {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(CardWhite)
                                    .padding(Dimens.SpacingLg),
                            ) {
                                Text("Remark", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = TextSecondary)
                                Spacer(Modifier.height(Dimens.SpacingXs))
                                Text(order.remark!!, fontSize = 14.sp, color = TextPrimary)
                            }
                        }
                    }

                    item { Spacer(Modifier.height(80.dp)) }
                }
            } else {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(state.error ?: "Order not found", color = TextSecondary)
                }
            }
        }
    }

    // Cancel dialog
    if (state.showCancelDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissCancelDialog() },
            title = { Text("Cancel Order") },
            text = { Text("Are you sure you want to cancel this order?") },
            confirmButton = {
                TextButton(onClick = { viewModel.cancelOrder() }) {
                    Text("Cancel Order", color = PriceRed)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.dismissCancelDialog() }) {
                    Text("Keep Order")
                }
            },
        )
    }
}

@Composable
private fun StatusBanner(status: String) {
    val gradient = Brush.horizontalGradient(
        colors = listOf(DarkNavy, Color(0xFF232F3E))
    )
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(gradient)
            .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingXl),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            StatusBadge(status = status)
            Spacer(Modifier.width(Dimens.SpacingMd))
            Text(
                text = getStatusDescription(status),
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.8f),
            )
        }
    }
}

private fun getStatusDescription(status: String): String {
    return when (status) {
        OrderStatus.PENDING -> "Please complete payment within 30 minutes"
        OrderStatus.PAID -> "Payment received, waiting for shipment"
        OrderStatus.SHIPPED -> "Your order is on its way"
        OrderStatus.DELIVERED -> "Your order has been delivered"
        OrderStatus.COMPLETED -> "Order completed"
        OrderStatus.CANCELLED -> "Order has been cancelled"
        OrderStatus.REFUNDED -> "Refund processed"
        else -> ""
    }
}

@Composable
private fun AddressSection(address: OrderAddressData) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(Dimens.SpacingLg),
        verticalAlignment = Alignment.Top,
    ) {
        Icon(
            imageVector = Icons.Default.LocationOn,
            contentDescription = null,
            tint = Teal,
            modifier = Modifier.size(20.dp),
        )
        Spacer(Modifier.width(Dimens.SpacingSm))
        Column {
            Row {
                Text(address.recipient, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                Spacer(Modifier.width(Dimens.SpacingMd))
                Text(address.phone, fontSize = 13.sp, color = TextSecondary)
            }
            Spacer(Modifier.height(Dimens.SpacingXs))
            Text(
                text = "${address.province} ${address.city} ${address.district} ${address.address}",
                fontSize = 13.sp,
                color = TextSecondary,
            )
        }
    }
}

@Composable
private fun OrderItemRow(item: OrderItemData) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
        verticalAlignment = Alignment.Top,
    ) {
        AsyncImage(
            model = item.imageUrl,
            contentDescription = item.productTitle,
            modifier = Modifier
                .size(72.dp)
                .clip(RoundedCornerShape(Dimens.RadiusSm)),
            contentScale = ContentScale.Crop,
        )
        Spacer(Modifier.width(Dimens.SpacingMd))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.productTitle,
                fontSize = 14.sp,
                color = TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            item.skuAttrs?.let { attrs ->
                val attrText = attrs.entries
                    .map { (_, v) -> v.jsonPrimitive.content }
                    .joinToString(" · ")
                if (attrText.isNotEmpty()) {
                    Spacer(Modifier.height(Dimens.SpacingXs))
                    Text(attrText, fontSize = 12.sp, color = TextSecondary)
                }
            }
            Spacer(Modifier.height(Dimens.SpacingSm))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    text = "¥${PriceFormatter.format(item.unitPrice)}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PriceRed,
                )
                Text("x${item.quantity}", fontSize = 14.sp, color = TextSecondary)
            }
        }
    }
}

@Composable
private fun OrderSummary(order: OrderDetailResult) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(Dimens.SpacingLg),
    ) {
        SummaryLine("Subtotal", "¥${PriceFormatter.format(order.totalAmount)}")
        if (order.discountAmount != "0" && order.discountAmount != "0.00") {
            Spacer(Modifier.height(Dimens.SpacingSm))
            SummaryLine("Discount", "-¥${PriceFormatter.format(order.discountAmount)}")
        }
        Spacer(Modifier.height(Dimens.SpacingMd))
        HorizontalDivider(color = Divider)
        Spacer(Modifier.height(Dimens.SpacingMd))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Total", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
            Text(
                text = "¥${PriceFormatter.format(order.payAmount)}",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = PriceRed,
            )
        }
    }
}

@Composable
private fun SummaryLine(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontSize = 14.sp, color = TextSecondary)
        Text(value, fontSize = 14.sp, color = TextPrimary)
    }
}

@Composable
private fun OrderInfo(order: OrderDetailResult) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(Dimens.SpacingLg),
    ) {
        Text("Order Information", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = TextSecondary)
        Spacer(Modifier.height(Dimens.SpacingMd))
        InfoRow("Order No.", order.orderNo)
        InfoRow("Created", DateFormatter.formatDateTime(order.createdAt))
        order.paidAt?.let { InfoRow("Paid", DateFormatter.formatDateTime(it)) }
        order.shippedAt?.let { InfoRow("Shipped", DateFormatter.formatDateTime(it)) }
        order.deliveredAt?.let { InfoRow("Delivered", DateFormatter.formatDateTime(it)) }
        order.cancelledAt?.let { InfoRow("Cancelled", DateFormatter.formatDateTime(it)) }
        order.cancelReason?.let { InfoRow("Cancel Reason", it) }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = Dimens.SpacingXs),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, fontSize = 13.sp, color = TextSecondary)
        Text(
            text = value,
            fontSize = 13.sp,
            color = TextPrimary,
            modifier = Modifier.padding(start = Dimens.SpacingLg),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun OrderDetailBottomBar(
    status: String,
    onCancel: () -> Unit,
    onPay: () -> Unit,
    isCancelling: Boolean,
) {
    val showCancel = status == OrderStatus.PENDING || status == OrderStatus.PAID
    val showPay = status == OrderStatus.PENDING

    if (!showCancel && !showPay) return

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite),
    ) {
        HorizontalDivider(color = Divider)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
            horizontalArrangement = Arrangement.End,
        ) {
            if (showCancel) {
                OutlinedButton(
                    onClick = onCancel,
                    enabled = !isCancelling,
                    shape = RoundedCornerShape(Dimens.RadiusMd),
                ) {
                    Text("Cancel Order")
                }
            }
            if (showPay) {
                Spacer(Modifier.width(Dimens.SpacingMd))
                Button(
                    onClick = onPay,
                    shape = RoundedCornerShape(Dimens.RadiusMd),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Orange,
                        contentColor = TextPrimary,
                    ),
                ) {
                    Text("Pay Now", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
