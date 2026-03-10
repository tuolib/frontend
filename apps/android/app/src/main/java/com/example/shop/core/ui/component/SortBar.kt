package com.example.shop.core.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary

data class SortOption(
    val label: String,
    val sort: String,
    val order: String,
)

val defaultSortOptions = listOf(
    SortOption("Overall", "createdAt", "desc"),
    SortOption("Price ↑", "price", "asc"),
    SortOption("Price ↓", "price", "desc"),
    SortOption("Sales", "sales", "desc"),
)

@Composable
fun SortBar(
    currentSort: String,
    currentOrder: String,
    onSortChange: (sort: String, order: String) -> Unit,
    modifier: Modifier = Modifier,
    options: List<SortOption> = defaultSortOptions,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(horizontal = Dimens.SpacingMd, vertical = Dimens.SpacingSm),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        options.forEach { option ->
            val isSelected = option.sort == currentSort && option.order == currentOrder
            Row(
                modifier = Modifier
                    .clickable { onSortChange(option.sort, option.order) }
                    .padding(horizontal = Dimens.SpacingSm, vertical = Dimens.SpacingXs),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = option.label,
                    fontSize = 13.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = if (isSelected) Teal else TextSecondary,
                )
            }
        }
    }
}
