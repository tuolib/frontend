package com.example.shop.feature.order.payment

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.shop.core.ui.component.LoadingButton
import com.example.shop.core.ui.component.PageHeader
import com.example.shop.core.ui.theme.BackgroundGray
import com.example.shop.core.ui.theme.CardWhite
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.Orange
import com.example.shop.core.ui.theme.PriceRed
import com.example.shop.core.ui.theme.Success
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.core.util.PriceFormatter

@Composable
fun PaymentScreen(
    onBack: () -> Unit,
    onNavigateToOrderDetail: (String) -> Unit,
    onNavigateToHome: () -> Unit,
    viewModel: PaymentViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is PaymentEvent.ShowMessage -> snackbarHostState.showSnackbar(event.message)
                is PaymentEvent.NavigateToOrderDetail -> onNavigateToOrderDetail(event.orderId)
                is PaymentEvent.NavigateToHome -> onNavigateToHome()
            }
        }
    }

    Scaffold(
        topBar = { PageHeader(title = "Payment", onBack = onBack) },
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
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Teal)
                    }
                }
                state.isSuccess -> {
                    PaymentSuccessOverlay(
                        onViewOrder = { viewModel.goToOrderDetail() },
                        onContinueShopping = { viewModel.goToHome() },
                    )
                }
                else -> {
                    PaymentContent(
                        state = state,
                        onSelectMethod = { viewModel.selectMethod(it) },
                        onPay = { viewModel.pay() },
                    )
                }
            }
        }
    }
}

@Composable
private fun PaymentContent(
    state: PaymentUiState,
    onSelectMethod: (String) -> Unit,
    onPay: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize(),
    ) {
        // Amount section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardWhite)
                .padding(vertical = Dimens.Spacing3xl, horizontal = Dimens.SpacingLg),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = "Amount Due",
                fontSize = 14.sp,
                color = TextSecondary,
            )
            Spacer(Modifier.height(Dimens.SpacingSm))

            // Split price display: ¥ + integer.decimal
            val formatted = PriceFormatter.format(state.payAmount)
            Row(
                verticalAlignment = Alignment.Top,
            ) {
                Text(
                    text = "¥",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = PriceRed,
                    modifier = Modifier.padding(top = 6.dp),
                )
                Text(
                    text = formatted,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = PriceRed,
                )
            }

            Spacer(Modifier.height(Dimens.SpacingMd))

            // Countdown
            if (!state.isExpired) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        Icons.Default.Timer,
                        contentDescription = null,
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp),
                    )
                    Spacer(Modifier.width(Dimens.SpacingXs))
                    Text(
                        text = "Pay within ${state.remainingMinutes}:${"%02d".format(state.remainingSeconds)}",
                        fontSize = 13.sp,
                        color = TextSecondary,
                    )
                }
            } else {
                Text(
                    text = "Payment expired",
                    fontSize = 13.sp,
                    color = PriceRed,
                )
            }
        }

        Spacer(Modifier.height(Dimens.SpacingSm))

        // Payment methods
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardWhite)
                .padding(Dimens.SpacingLg),
        ) {
            Text(
                text = "Payment Method",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
            )
            Spacer(Modifier.height(Dimens.SpacingMd))

            PaymentMethodOption(
                label = "Alipay",
                value = "alipay",
                selected = state.selectedMethod,
                onSelect = onSelectMethod,
            )
            HorizontalDivider(color = Divider)
            PaymentMethodOption(
                label = "WeChat Pay",
                value = "wechat",
                selected = state.selectedMethod,
                onSelect = onSelectMethod,
            )
            HorizontalDivider(color = Divider)
            PaymentMethodOption(
                label = "Mock Payment (Test)",
                value = "mock",
                selected = state.selectedMethod,
                onSelect = onSelectMethod,
            )
        }

        Spacer(Modifier.weight(1f))

        // Pay button
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardWhite)
                .padding(Dimens.SpacingLg),
        ) {
            LoadingButton(
                text = "Pay Now ¥${PriceFormatter.format(state.payAmount)}",
                onClick = onPay,
                isLoading = state.isPaying,
                enabled = !state.isExpired,
            )
        }
    }
}

@Composable
private fun PaymentMethodOption(
    label: String,
    value: String,
    selected: String,
    onSelect: (String) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = Dimens.SpacingMd),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            fontSize = 15.sp,
            color = TextPrimary,
            modifier = Modifier.weight(1f),
        )
        RadioButton(
            selected = selected == value,
            onClick = { onSelect(value) },
            colors = RadioButtonDefaults.colors(selectedColor = Teal),
        )
    }
}

@Composable
private fun PaymentSuccessOverlay(
    onViewOrder: () -> Unit,
    onContinueShopping: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CardWhite)
            .padding(Dimens.Spacing3xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(
            imageVector = Icons.Default.CheckCircle,
            contentDescription = null,
            tint = Success,
            modifier = Modifier.size(72.dp),
        )
        Spacer(Modifier.height(Dimens.SpacingLg))
        Text(
            text = "Payment Successful",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
        )
        Spacer(Modifier.height(Dimens.SpacingSm))
        Text(
            text = "Your order has been placed successfully",
            fontSize = 14.sp,
            color = TextSecondary,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(Dimens.Spacing3xl))
        Button(
            onClick = onViewOrder,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(Dimens.RadiusMd),
            colors = ButtonDefaults.buttonColors(
                containerColor = Orange,
                contentColor = TextPrimary,
            ),
        ) {
            Text("View Order", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
        }
        Spacer(Modifier.height(Dimens.SpacingMd))
        OutlinedButton(
            onClick = onContinueShopping,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(Dimens.RadiusMd),
        ) {
            Text("Continue Shopping", fontSize = 16.sp)
        }
    }
}
