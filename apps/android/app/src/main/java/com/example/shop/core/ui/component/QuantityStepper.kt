package com.example.shop.core.ui.component

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary

@Composable
fun QuantityStepper(
    quantity: Int,
    onQuantityChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    minQuantity: Int = 1,
    maxQuantity: Int = 99,
) {
    Row(
        modifier = modifier
            .border(1.dp, Divider, RoundedCornerShape(Dimens.RadiusSm)),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        IconButton(
            onClick = { if (quantity > minQuantity) onQuantityChange(quantity - 1) },
            enabled = quantity > minQuantity,
            modifier = Modifier.size(32.dp),
        ) {
            Icon(
                imageVector = Icons.Default.Remove,
                contentDescription = "Decrease",
                modifier = Modifier.size(16.dp),
                tint = if (quantity > minQuantity) TextPrimary else TextSecondary.copy(alpha = 0.3f),
            )
        }
        Text(
            text = "$quantity",
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = TextPrimary,
            textAlign = TextAlign.Center,
            modifier = Modifier.size(width = 32.dp, height = 32.dp),
            lineHeight = 32.sp,
        )
        IconButton(
            onClick = { if (quantity < maxQuantity) onQuantityChange(quantity + 1) },
            enabled = quantity < maxQuantity,
            modifier = Modifier.size(32.dp),
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Increase",
                modifier = Modifier.size(16.dp),
                tint = if (quantity < maxQuantity) TextPrimary else TextSecondary.copy(alpha = 0.3f),
            )
        }
    }
}
