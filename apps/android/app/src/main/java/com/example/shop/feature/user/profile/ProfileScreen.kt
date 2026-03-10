package com.example.shop.feature.user.profile

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
import androidx.compose.material.icons.automirrored.outlined.ExitToApp
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
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
import com.example.shop.feature.order.data.model.OrderListItem
import com.example.shop.feature.order.list.StatusBadge

@Composable
fun ProfileScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToAddress: () -> Unit,
    onNavigateToOrderDetail: (String) -> Unit,
    onLogoutSuccess: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val isLoggedIn by viewModel.isLoggedIn.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    var showLogoutDialog by remember { mutableStateOf(false) }

    LaunchedEffect(isLoggedIn) {
        if (isLoggedIn) {
            viewModel.loadProfile()
            viewModel.loadRecentOrders()
        }
    }

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is ProfileEvent.LogoutSuccess -> onLogoutSuccess()
                is ProfileEvent.ShowError -> snackbarHostState.showSnackbar(event.message)
            }
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Sign Out") },
            text = { Text("Are you sure you want to sign out?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout()
                    },
                ) {
                    Text("Sign Out", color = PriceRed)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = Teal)
                }
            },
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        if (isLoggedIn) {
            AuthenticatedContent(
                state = state,
                onOrdersClick = onNavigateToOrders,
                onAddressClick = onNavigateToAddress,
                onOrderClick = onNavigateToOrderDetail,
                onSignOutClick = { showLogoutDialog = true },
                modifier = Modifier.padding(innerPadding),
            )
        } else {
            GuestContent(
                onSignInClick = onNavigateToLogin,
                modifier = Modifier.padding(innerPadding),
            )
        }
    }
}

@Composable
private fun AuthenticatedContent(
    state: ProfileUiState,
    onOrdersClick: () -> Unit,
    onAddressClick: () -> Unit,
    onOrderClick: (String) -> Unit,
    onSignOutClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundGray),
    ) {
        // Greeting header
        item {
            GreetingHeader(
                nickname = state.user?.nickname,
                email = state.user?.email,
                isLoading = state.isLoading,
            )
        }

        // Quick actions 2x2 grid
        item {
            Spacer(Modifier.height(Dimens.SpacingSm))
            QuickActionsGrid(
                onOrdersClick = onOrdersClick,
                onAddressClick = onAddressClick,
                onSignOutClick = onSignOutClick,
            )
        }

        // Recent orders section
        item {
            Spacer(Modifier.height(Dimens.SpacingSm))
            RecentOrdersHeader(onSeeAllClick = onOrdersClick)
        }

        if (state.ordersLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(CardWhite)
                        .padding(Dimens.Spacing3xl),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(color = Teal, modifier = Modifier.size(24.dp))
                }
            }
        } else if (state.recentOrders.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(CardWhite)
                        .padding(Dimens.Spacing3xl),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "No orders yet",
                        fontSize = 14.sp,
                        color = TextSecondary,
                    )
                }
            }
        } else {
            items(state.recentOrders, key = { it.orderId }) { order ->
                RecentOrderCard(
                    order = order,
                    onClick = { onOrderClick(order.orderId) },
                )
            }
        }

        item { Spacer(Modifier.height(Dimens.SpacingLg)) }
    }
}

@Composable
private fun GuestContent(
    onSignInClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundGray),
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color(0xFF232F3E), DarkNavy),
                    ),
                )
                .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.Spacing3xl),
        ) {
            Column {
                Text(
                    text = "Hello!",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                )
                Spacer(Modifier.height(Dimens.SpacingXs))
                Text(
                    text = "Sign in to access your orders, addresses, and more",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.7f),
                )
            }
        }

        Spacer(Modifier.height(Dimens.SpacingLg))

        // Sign in button
        Button(
            onClick = onSignInClick,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Dimens.SpacingLg)
                .height(48.dp),
            shape = RoundedCornerShape(Dimens.RadiusMd),
            colors = ButtonDefaults.buttonColors(
                containerColor = Orange,
                contentColor = TextPrimary,
            ),
        ) {
            Text(
                text = "Sign In",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun GreetingHeader(
    nickname: String?,
    email: String?,
    isLoading: Boolean,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF232F3E), DarkNavy),
                ),
            )
            .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingXxl),
    ) {
        if (isLoading) {
            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
        } else {
            val displayName = nickname
                ?: email?.substringBefore("@")
                ?: "User"
            Column {
                Text(
                    text = "Hello, $displayName",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                )
                if (email != null) {
                    Spacer(Modifier.height(Dimens.SpacingXs))
                    Text(
                        text = email,
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.6f),
                    )
                }
            }
        }
    }
}

@Composable
private fun QuickActionsGrid(
    onOrdersClick: () -> Unit,
    onAddressClick: () -> Unit,
    onSignOutClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(Dimens.SpacingLg),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpacingMd),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingMd),
        ) {
            ActionCard(
                icon = Icons.Outlined.ShoppingBag,
                label = "Your Orders",
                onClick = onOrdersClick,
                modifier = Modifier.weight(1f),
            )
            ActionCard(
                icon = Icons.Outlined.LocationOn,
                label = "Your Addresses",
                onClick = onAddressClick,
                modifier = Modifier.weight(1f),
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingMd),
        ) {
            ActionCard(
                icon = Icons.Outlined.Person,
                label = "Account",
                onClick = { /* TODO: account settings */ },
                modifier = Modifier.weight(1f),
            )
            ActionCard(
                icon = Icons.AutoMirrored.Outlined.ExitToApp,
                label = "Sign Out",
                onClick = onSignOutClick,
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun ActionCard(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .background(BackgroundGray)
            .clickable(onClick = onClick)
            .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Teal,
            modifier = Modifier.size(24.dp),
        )
        Spacer(Modifier.width(Dimens.SpacingSm))
        Text(
            text = label,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun RecentOrdersHeader(onSeeAllClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(start = Dimens.SpacingLg, end = Dimens.SpacingSm, top = Dimens.SpacingLg),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "Your Orders",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
        )
        TextButton(onClick = onSeeAllClick) {
            Text(
                text = "See all",
                fontSize = 14.sp,
                color = Teal,
            )
        }
    }
}

@Composable
private fun RecentOrderCard(
    order: OrderListItem,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .clickable(onClick = onClick)
            .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
    ) {
        // Header: order no + status
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "#${order.orderNo}",
                fontSize = 12.sp,
                color = TextSecondary,
            )
            StatusBadge(status = order.status)
        }

        Spacer(Modifier.height(Dimens.SpacingSm))

        // Product info
        order.firstItem?.let { item ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(48.dp)
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
                    Spacer(Modifier.height(Dimens.SpacingXs))
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(
                            text = DateFormatter.formatDateTime(order.createdAt),
                            fontSize = 12.sp,
                            color = TextSecondary,
                        )
                        Text(
                            text = "¥${PriceFormatter.format(order.payAmount)}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = PriceRed,
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(Dimens.SpacingSm))
        HorizontalDivider(color = Divider)
    }
}
