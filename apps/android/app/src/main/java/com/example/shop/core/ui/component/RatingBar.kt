package com.example.shop.core.ui.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.StarHalf
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.shop.core.ui.theme.StarYellow
import com.example.shop.core.ui.theme.TextSecondary

@Composable
fun RatingBar(
    rating: Float,
    modifier: Modifier = Modifier,
    reviewCount: Int = 0,
    starSize: Dp = 14.dp,
    showCount: Boolean = true,
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(1.dp),
    ) {
        for (i in 1..5) {
            val icon = when {
                i <= rating.toInt() -> Icons.Filled.Star
                i - 0.5f <= rating -> Icons.AutoMirrored.Filled.StarHalf
                else -> Icons.Filled.StarOutline
            }
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(starSize),
                tint = StarYellow,
            )
        }
        if (showCount && reviewCount > 0) {
            Text(
                text = if (reviewCount >= 1000) " ${reviewCount / 1000}k+" else " $reviewCount",
                color = TextSecondary,
                fontSize = (starSize.value - 2).sp,
            )
        }
    }
}
