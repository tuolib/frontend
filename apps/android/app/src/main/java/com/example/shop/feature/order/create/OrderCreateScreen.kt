package com.example.shop.feature.order.create

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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.example.shop.core.ui.component.LoadingButton
import com.example.shop.core.ui.component.PageHeader
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
import com.example.shop.feature.cart.data.model.CheckoutPreviewItem
import com.example.shop.feature.user.data.model.Address
import com.example.shop.feature.user.data.model.AddressCreateRequest
import kotlinx.serialization.json.jsonPrimitive

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderCreateScreen(
    onBack: () -> Unit,
    onNavigateToPayment: (String) -> Unit,
    onNavigateToAddressManage: () -> Unit,
    viewModel: OrderCreateViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is OrderCreateEvent.ShowMessage -> snackbarHostState.showSnackbar(event.message)
                is OrderCreateEvent.NavigateToPayment -> onNavigateToPayment(event.orderId)
            }
        }
    }

    Scaffold(
        topBar = { PageHeader(title = "Confirm Order", onBack = onBack) },
        bottomBar = {
            if (!state.isLoading && state.preview != null) {
                OrderCreateBottomBar(
                    payAmount = state.preview!!.summary.payAmount,
                    isSubmitting = state.isSubmitting,
                    onPlaceOrder = { viewModel.placeOrder() },
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
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                ) {
                    item { Spacer(Modifier.height(Dimens.SpacingSm)) }

                    // Address section
                    item {
                        AddressSection(
                            address = state.selectedAddress,
                            onClick = {
                                if (state.addresses.isEmpty()) {
                                    viewModel.toggleAddressForm(true)
                                } else {
                                    viewModel.toggleAddressPicker(true)
                                }
                            },
                        )
                    }

                    // Items
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(CardWhite)
                                .padding(Dimens.SpacingLg),
                        ) {
                            Text(
                                text = "Items (${state.preview?.items?.size ?: 0})",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary,
                            )
                        }
                    }
                    items(state.preview?.items ?: emptyList()) { item ->
                        CheckoutItemRow(item)
                    }

                    // Remark
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(CardWhite)
                                .padding(Dimens.SpacingLg),
                        ) {
                            Text(
                                text = "Remark",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = TextPrimary,
                            )
                            Spacer(Modifier.height(Dimens.SpacingSm))
                            OutlinedTextField(
                                value = state.remark,
                                onValueChange = { viewModel.updateRemark(it) },
                                placeholder = { Text("Optional note (max 500 chars)") },
                                modifier = Modifier.fillMaxWidth(),
                                maxLines = 3,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                            )
                        }
                    }

                    // Summary
                    item {
                        state.preview?.let { preview ->
                            OrderSummarySection(
                                itemsTotal = preview.summary.itemsTotal,
                                shippingFee = preview.summary.shippingFee,
                                discountAmount = preview.summary.discountAmount,
                                payAmount = preview.summary.payAmount,
                            )
                        }
                    }

                    item { Spacer(Modifier.height(80.dp)) }
                }
            }
        }
    }

    // Address Picker Bottom Sheet
    if (state.showAddressPicker) {
        ModalBottomSheet(
            onDismissRequest = { viewModel.toggleAddressPicker(false) },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        ) {
            AddressPickerSheet(
                addresses = state.addresses,
                selectedId = state.selectedAddressId,
                onSelect = { viewModel.selectAddress(it) },
                onAddNew = {
                    viewModel.toggleAddressPicker(false)
                    viewModel.toggleAddressForm(true)
                },
            )
        }
    }

    // Address Form Bottom Sheet
    if (state.showAddressForm) {
        ModalBottomSheet(
            onDismissRequest = { viewModel.toggleAddressForm(false) },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        ) {
            AddressFormSheet(
                onSave = { request -> viewModel.saveAddress(request) },
                onDismiss = { viewModel.toggleAddressForm(false) },
            )
        }
    }
}

@Composable
private fun AddressSection(
    address: Address?,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .clickable(onClick = onClick)
            .padding(Dimens.SpacingLg),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Default.LocationOn,
            contentDescription = null,
            tint = Teal,
            modifier = Modifier.size(24.dp),
        )
        Spacer(Modifier.width(Dimens.SpacingMd))
        if (address != null) {
            Column(modifier = Modifier.weight(1f)) {
                Row {
                    Text(
                        text = address.recipient,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary,
                    )
                    Spacer(Modifier.width(Dimens.SpacingMd))
                    Text(
                        text = address.phone,
                        fontSize = 14.sp,
                        color = TextSecondary,
                    )
                }
                Spacer(Modifier.height(Dimens.SpacingXs))
                Text(
                    text = "${address.province} ${address.city} ${address.district} ${address.address}",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        } else {
            Text(
                text = "Add delivery address",
                fontSize = 15.sp,
                color = Teal,
                modifier = Modifier.weight(1f),
            )
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = TextSecondary,
            modifier = Modifier.size(20.dp),
        )
    }
}

@Composable
private fun CheckoutItemRow(item: CheckoutPreviewItem) {
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
                    Text(text = attrText, fontSize = 12.sp, color = TextSecondary)
                }
            }
            Spacer(Modifier.height(Dimens.SpacingSm))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    text = "¥${PriceFormatter.format(item.currentPrice)}",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PriceRed,
                )
                Text(
                    text = "x${item.quantity}",
                    fontSize = 14.sp,
                    color = TextSecondary,
                )
            }
        }
    }
}

@Composable
private fun OrderSummarySection(
    itemsTotal: String,
    shippingFee: String,
    discountAmount: String,
    payAmount: String,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(Dimens.SpacingLg),
    ) {
        SummaryRow("Subtotal", "¥${PriceFormatter.format(itemsTotal)}")
        Spacer(Modifier.height(Dimens.SpacingSm))
        SummaryRow(
            "Shipping",
            if (shippingFee == "0" || shippingFee == "0.00") "Free" else "¥${PriceFormatter.format(shippingFee)}",
        )
        if (discountAmount != "0" && discountAmount != "0.00") {
            Spacer(Modifier.height(Dimens.SpacingSm))
            SummaryRow("Discount", "-¥${PriceFormatter.format(discountAmount)}", valueColor = PriceRed)
        }
        Spacer(Modifier.height(Dimens.SpacingMd))
        HorizontalDivider(thickness = 1.dp, color = Divider)
        Spacer(Modifier.height(Dimens.SpacingMd))
        SummaryRow(
            "Total",
            "¥${PriceFormatter.format(payAmount)}",
            labelWeight = FontWeight.SemiBold,
            valueWeight = FontWeight.Bold,
            valueColor = PriceRed,
            valueFontSize = 18.sp,
        )
    }
}

@Composable
private fun SummaryRow(
    label: String,
    value: String,
    labelWeight: FontWeight = FontWeight.Normal,
    valueWeight: FontWeight = FontWeight.Normal,
    valueColor: Color = TextPrimary,
    valueFontSize: androidx.compose.ui.unit.TextUnit = 14.sp,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            fontSize = 14.sp,
            fontWeight = labelWeight,
            color = TextSecondary,
        )
        Text(
            text = value,
            fontSize = valueFontSize,
            fontWeight = valueWeight,
            color = valueColor,
        )
    }
}

@Composable
private fun OrderCreateBottomBar(
    payAmount: String,
    isSubmitting: Boolean,
    onPlaceOrder: () -> Unit,
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
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Total",
                    fontSize = 13.sp,
                    color = TextSecondary,
                )
                Text(
                    text = "¥${PriceFormatter.format(payAmount)}",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = PriceRed,
                )
            }
            LoadingButton(
                text = "Place Order",
                onClick = onPlaceOrder,
                isLoading = isSubmitting,
                modifier = Modifier.width(160.dp),
            )
        }
    }
}

@Composable
private fun AddressPickerSheet(
    addresses: List<Address>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    onAddNew: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = Dimens.SpacingLg),
    ) {
        Text(
            text = "Select Address",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
            modifier = Modifier.padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
        )
        HorizontalDivider(color = Divider)
        addresses.forEach { address ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSelect(address.id) }
                    .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                RadioButton(
                    selected = address.id == selectedId,
                    onClick = { onSelect(address.id) },
                    colors = RadioButtonDefaults.colors(selectedColor = Teal),
                )
                Spacer(Modifier.width(Dimens.SpacingSm))
                Column(modifier = Modifier.weight(1f)) {
                    Row {
                        Text(address.recipient, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        Spacer(Modifier.width(Dimens.SpacingSm))
                        Text(address.phone, fontSize = 13.sp, color = TextSecondary)
                    }
                    Text(
                        text = "${address.province} ${address.city} ${address.district} ${address.address}",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        maxLines = 2,
                    )
                }
            }
            HorizontalDivider(color = Divider, modifier = Modifier.padding(horizontal = Dimens.SpacingLg))
        }
        Spacer(Modifier.height(Dimens.SpacingSm))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onAddNew)
                .padding(horizontal = Dimens.SpacingLg, vertical = Dimens.SpacingMd),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
        ) {
            Icon(Icons.Default.Add, contentDescription = null, tint = Teal, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(Dimens.SpacingXs))
            Text("Add New Address", fontSize = 14.sp, color = Teal, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun AddressFormSheet(
    onSave: (AddressCreateRequest) -> Unit,
    onDismiss: () -> Unit,
) {
    var recipient by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var province by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var district by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var label by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.SpacingLg)
            .padding(bottom = Dimens.Spacing3xl),
    ) {
        Text(
            text = "New Address",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = Dimens.SpacingLg),
        )

        FormField("Recipient *", recipient) { recipient = it }
        FormField("Phone *", phone) { phone = it }
        FormField("Province *", province) { province = it }
        FormField("City *", city) { city = it }
        FormField("District *", district) { district = it }
        FormField("Address Detail *", address) { address = it }
        FormField("Label (optional)", label) { label = it }

        Spacer(Modifier.height(Dimens.SpacingLg))

        val isValid = recipient.isNotBlank() && phone.isNotBlank() && province.isNotBlank() &&
            city.isNotBlank() && district.isNotBlank() && address.isNotBlank()

        LoadingButton(
            text = "Save Address",
            onClick = {
                onSave(
                    AddressCreateRequest(
                        recipient = recipient.trim(),
                        phone = phone.trim(),
                        province = province.trim(),
                        city = city.trim(),
                        district = district.trim(),
                        address = address.trim(),
                        label = label.trim().ifBlank { null },
                    )
                )
            },
            enabled = isValid,
        )
    }
}

@Composable
private fun FormField(label: String, value: String, onValueChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = Dimens.SpacingMd),
        singleLine = true,
    )
}
