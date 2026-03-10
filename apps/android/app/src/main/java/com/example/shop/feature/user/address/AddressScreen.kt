package com.example.shop.feature.user.address

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.shop.core.ui.component.EmptyState
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
import com.example.shop.feature.user.data.model.Address

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressScreen(
    onBack: () -> Unit,
    viewModel: AddressViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is AddressEvent.ShowMessage -> snackbarHostState.showSnackbar(event.message)
            }
        }
    }

    Scaffold(
        topBar = {
            PageHeader(
                title = "My Addresses",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { viewModel.showAddForm() }) {
                        Icon(Icons.Default.Add, contentDescription = "Add", tint = TextPrimary)
                    }
                },
            )
        },
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
                state.addresses.isEmpty() -> {
                    EmptyState(
                        title = "No addresses yet",
                        subtitle = "Add a delivery address",
                        icon = Icons.Outlined.LocationOn,
                        modifier = Modifier.fillMaxSize(),
                        action = {
                            LoadingButton(
                                text = "Add Address",
                                onClick = { viewModel.showAddForm() },
                                modifier = Modifier.width(200.dp),
                            )
                        },
                    )
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                    ) {
                        item { Spacer(Modifier.height(Dimens.SpacingSm)) }
                        items(state.addresses, key = { it.id }) { address ->
                            AddressCard(
                                address = address,
                                onEdit = { viewModel.showEditForm(address) },
                                onDelete = { viewModel.showDeleteConfirm(address) },
                                onSetDefault = { viewModel.setDefault(address.id) },
                            )
                        }
                        item { Spacer(Modifier.height(Dimens.SpacingSm)) }
                    }
                }
            }
        }
    }

    // Address form bottom sheet
    if (state.showForm) {
        ModalBottomSheet(
            onDismissRequest = { viewModel.dismissForm() },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        ) {
            AddressFormContent(
                editing = state.editingAddress,
                isSaving = state.isSaving,
                onSave = { recipient, phone, province, city, district, address, label, postalCode, isDefault ->
                    viewModel.saveAddress(recipient, phone, province, city, district, address, label, postalCode, isDefault)
                },
                onDismiss = { viewModel.dismissForm() },
            )
        }
    }

    // Delete confirmation
    state.showDeleteDialog?.let { address ->
        AlertDialog(
            onDismissRequest = { viewModel.dismissDeleteConfirm() },
            title = { Text("Delete Address") },
            text = { Text("Are you sure you want to delete this address?") },
            confirmButton = {
                TextButton(onClick = { viewModel.deleteAddress(address.id) }) {
                    Text("Delete", color = PriceRed)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.dismissDeleteConfirm() }) {
                    Text("Cancel")
                }
            },
        )
    }
}

@Composable
private fun AddressCard(
    address: Address,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onSetDefault: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardWhite)
            .padding(Dimens.SpacingLg),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
        ) {
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
            if (address.isDefault) {
                Spacer(Modifier.width(Dimens.SpacingSm))
                Text(
                    text = "Default",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Teal,
                    modifier = Modifier
                        .border(1.dp, Teal, RoundedCornerShape(Dimens.RadiusSm))
                        .padding(horizontal = Dimens.SpacingSm, vertical = Dimens.SpacingXxs),
                )
            }
        }

        Spacer(Modifier.height(Dimens.SpacingSm))

        Text(
            text = "${address.province} ${address.city} ${address.district} ${address.address}",
            fontSize = 13.sp,
            color = TextSecondary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )

        address.label?.let { lab ->
            Spacer(Modifier.height(Dimens.SpacingXs))
            Text(
                text = lab,
                fontSize = 12.sp,
                color = Teal,
            )
        }

        Spacer(Modifier.height(Dimens.SpacingMd))

        // Actions row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (!address.isDefault) {
                TextButton(onClick = onSetDefault) {
                    Text("Set as default", fontSize = 13.sp, color = Teal)
                }
            }
            IconButton(onClick = onEdit, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Default.Edit, contentDescription = "Edit", tint = TextSecondary, modifier = Modifier.size(18.dp))
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = TextSecondary, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun AddressFormContent(
    editing: Address?,
    isSaving: Boolean,
    onSave: (String, String, String, String, String, String, String?, String?, Boolean) -> Unit,
    onDismiss: () -> Unit,
) {
    var recipient by remember { mutableStateOf(editing?.recipient ?: "") }
    var phone by remember { mutableStateOf(editing?.phone ?: "") }
    var province by remember { mutableStateOf(editing?.province ?: "") }
    var city by remember { mutableStateOf(editing?.city ?: "") }
    var district by remember { mutableStateOf(editing?.district ?: "") }
    var address by remember { mutableStateOf(editing?.address ?: "") }
    var label by remember { mutableStateOf(editing?.label ?: "") }
    var postalCode by remember { mutableStateOf(editing?.postalCode ?: "") }
    var isDefault by remember { mutableStateOf(editing?.isDefault ?: false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.SpacingLg)
            .padding(bottom = Dimens.Spacing3xl),
    ) {
        Text(
            text = if (editing != null) "Edit Address" else "New Address",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = Dimens.SpacingLg),
        )

        AddressField("Recipient *", recipient) { recipient = it }
        AddressField("Phone *", phone) { phone = it }
        AddressField("Province *", province) { province = it }
        AddressField("City *", city) { city = it }
        AddressField("District *", district) { district = it }
        AddressField("Address Detail *", address) { address = it }
        AddressField("Label (optional)", label) { label = it }
        AddressField("Postal Code (optional)", postalCode) { postalCode = it }

        // Default switch
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = Dimens.SpacingSm),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("Set as default", fontSize = 15.sp, color = TextPrimary)
            Switch(
                checked = isDefault,
                onCheckedChange = { isDefault = it },
                colors = SwitchDefaults.colors(checkedTrackColor = Teal),
            )
        }

        Spacer(Modifier.height(Dimens.SpacingLg))

        val isValid = recipient.isNotBlank() && phone.isNotBlank() && province.isNotBlank() &&
            city.isNotBlank() && district.isNotBlank() && address.isNotBlank()

        LoadingButton(
            text = if (editing != null) "Update" else "Save",
            onClick = {
                onSave(
                    recipient.trim(), phone.trim(), province.trim(), city.trim(),
                    district.trim(), address.trim(), label.trim().ifBlank { null },
                    postalCode.trim().ifBlank { null }, isDefault,
                )
            },
            isLoading = isSaving,
            enabled = isValid,
        )
    }
}

@Composable
private fun AddressField(label: String, value: String, onValueChange: (String) -> Unit) {
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
