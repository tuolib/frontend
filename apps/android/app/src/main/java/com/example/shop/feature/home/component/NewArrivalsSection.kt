package com.example.shop.feature.home.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.util.PriceFormatter
import com.example.shop.feature.product.data.model.ProductListItem

@Composable
fun NewArrivalsSection(
    items: List<ProductListItem>,
    onProductClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (items.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "New Arrivals",
            modifier = Modifier.padding(horizontal = Dimens.SpacingMd),
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
        )

        Spacer(modifier = Modifier.height(Dimens.SpacingSm))

        LazyRow(
            contentPadding = PaddingValues(horizontal = Dimens.SpacingMd),
            horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
        ) {
            items(items, key = { it.id }) { product ->
                NewArrivalCard(
                    product = product,
                    onClick = { onProductClick(product.id) },
                )
            }
        }
    }
}

@Composable
private fun NewArrivalCard(
    product: ProductListItem,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .width(140.dp)
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
                    .height(140.dp)
                    .clip(RoundedCornerShape(Dimens.RadiusSm)),
                contentScale = ContentScale.Crop,
            )
            // NEW badge
            Text(
                text = "NEW",
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(4.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Teal)
                    .padding(horizontal = 6.dp, vertical = 2.dp),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = product.title,
            fontSize = 12.sp,
            color = TextPrimary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            lineHeight = 16.sp,
        )

        if (product.minPrice != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "¥${PriceFormatter.format(product.minPrice)}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = PriceRed,
            )
        }
    }
}
