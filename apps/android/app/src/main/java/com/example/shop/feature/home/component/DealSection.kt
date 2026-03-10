package com.example.shop.feature.home.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.PriceRed
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.core.util.PriceFormatter
import com.example.shop.feature.product.data.model.ProductListItem
import kotlinx.coroutines.delay
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@Composable
fun DealSection(
    items: List<ProductListItem>,
    onProductClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (items.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        // Section header with countdown
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Dimens.SpacingMd),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "Deal of the Day",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
            )
            Spacer(modifier = Modifier.width(Dimens.SpacingSm))
            DealCountdown()
        }

        Spacer(modifier = Modifier.height(Dimens.SpacingSm))

        LazyRow(
            contentPadding = PaddingValues(horizontal = Dimens.SpacingMd),
            horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
        ) {
            items(items, key = { it.id }) { product ->
                DealCard(
                    product = product,
                    onClick = { onProductClick(product.id) },
                )
            }
        }
    }
}

@Composable
private fun DealCountdown() {
    var remainingSeconds by remember { mutableLongStateOf(0L) }

    LaunchedEffect(Unit) {
        while (true) {
            val now = LocalDateTime.now()
            val midnight = LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.MIDNIGHT)
            remainingSeconds = Duration.between(now, midnight).seconds
            delay(1000)
        }
    }

    val hours = remainingSeconds / 3600
    val minutes = (remainingSeconds % 3600) / 60
    val seconds = remainingSeconds % 60

    Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
        TimeBox(String.format("%02d", hours))
        Text(text = ":", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PriceRed)
        TimeBox(String.format("%02d", minutes))
        Text(text = ":", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PriceRed)
        TimeBox(String.format("%02d", seconds))
    }
}

@Composable
private fun TimeBox(value: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(PriceRed)
            .padding(horizontal = 4.dp, vertical = 2.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
        )
    }
}

@Composable
private fun DealCard(
    product: ProductListItem,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .width(130.dp)
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .background(Color.White)
            .clickable(onClick = onClick)
            .padding(Dimens.SpacingSm),
    ) {
        Box {
            AsyncImage(
                model = product.primaryImage,
                contentDescription = product.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .clip(RoundedCornerShape(Dimens.RadiusSm)),
                contentScale = ContentScale.Crop,
            )
            // Discount badge
            val minPrice = product.minPrice?.toDoubleOrNull()
            val maxPrice = product.maxPrice?.toDoubleOrNull()
            if (minPrice != null && maxPrice != null && maxPrice > minPrice) {
                val discount = ((1 - minPrice / maxPrice) * 100).toInt()
                if (discount > 0) {
                    Text(
                        text = "-${discount}%",
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(4.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(PriceRed)
                            .padding(horizontal = 6.dp, vertical = 2.dp),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        if (product.minPrice != null) {
            Text(
                text = "¥${PriceFormatter.format(product.minPrice)}",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = PriceRed,
            )
        }

        Text(
            text = product.title,
            fontSize = 12.sp,
            color = TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )

        if (product.totalSales > 0) {
            Text(
                text = "${product.totalSales}+ bought",
                fontSize = 11.sp,
                color = TextSecondary,
            )
        }
    }
}
