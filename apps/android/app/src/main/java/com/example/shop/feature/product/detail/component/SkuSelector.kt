package com.example.shop.feature.product.detail.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary

data class SkuDimension(
    val name: String,
    val values: List<SkuDimensionValue>,
)

data class SkuDimensionValue(
    val value: String,
    val selected: Boolean,
    val disabled: Boolean,
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SkuSelector(
    dimensions: List<SkuDimension>,
    onSelect: (dimensionName: String, value: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        dimensions.forEach { dimension ->
            Text(
                text = dimension.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary,
            )
            Spacer(modifier = Modifier.height(Dimens.SpacingSm))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
            ) {
                dimension.values.forEach { option ->
                    SkuChip(
                        text = option.value,
                        selected = option.selected,
                        disabled = option.disabled,
                        onClick = { onSelect(dimension.name, option.value) },
                    )
                }
            }
            Spacer(modifier = Modifier.height(Dimens.SpacingMd))
        }
    }
}

@Composable
private fun SkuChip(
    text: String,
    selected: Boolean,
    disabled: Boolean,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(Dimens.RadiusMd)
    val backgroundColor = when {
        disabled -> Color(0xFFF5F5F5)
        selected -> Teal.copy(alpha = 0.08f)
        else -> Color.White
    }
    val borderColor = when {
        disabled -> Color(0xFFEEEEEE)
        selected -> Teal
        else -> Color(0xFFDDDDDD)
    }
    val textColor = when {
        disabled -> TextSecondary.copy(alpha = 0.4f)
        selected -> Teal
        else -> TextPrimary
    }

    Text(
        text = text,
        fontSize = 13.sp,
        fontWeight = if (selected) FontWeight.Medium else FontWeight.Normal,
        color = textColor,
        modifier = Modifier
            .clip(shape)
            .background(backgroundColor)
            .border(1.dp, borderColor, shape)
            .clickable(enabled = !disabled) { onClick() }
            .padding(horizontal = Dimens.SpacingMd, vertical = Dimens.SpacingSm),
    )
}
