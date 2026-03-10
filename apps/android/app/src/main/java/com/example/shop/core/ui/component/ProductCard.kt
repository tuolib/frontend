package com.example.shop.core.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.feature.product.data.model.ProductListItem

@Composable
fun ProductCard(
    product: ProductListItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .background(Color.White)
            .clickable(onClick = onClick)
            .padding(Dimens.SpacingSm),
    ) {
        AsyncImage(
            model = product.primaryImage,
            contentDescription = product.title,
            modifier = Modifier
                .fillMaxWidth()
                .height(Dimens.ProductCardImageHeight)
                .clip(RoundedCornerShape(Dimens.RadiusSm)),
            contentScale = ContentScale.Crop,
        )

        Spacer(modifier = Modifier.height(Dimens.SpacingSm))

        Text(
            text = product.title,
            fontSize = 13.sp,
            color = TextPrimary,
            maxLines = 2,
            minLines = 2,
            overflow = TextOverflow.Ellipsis,
            lineHeight = 18.sp,
        )

        Spacer(modifier = Modifier.height(4.dp))

        // Rating
        val rating = product.avgRating.toFloatOrNull() ?: 0f
        if (product.reviewCount > 0 && rating > 0f) {
            RatingBar(
                rating = rating,
                reviewCount = product.reviewCount,
                starSize = 12.dp,
            )
            Spacer(modifier = Modifier.height(4.dp))
        }

        // Price
        if (product.minPrice != null) {
            PriceText(
                price = product.minPrice,
                comparePrice = product.maxPrice,
                fontSize = 16.sp,
            )
        }

        // Sales badge
        if (product.totalSales > 0) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${product.totalSales}+ bought",
                fontSize = 11.sp,
                color = TextSecondary,
                fontWeight = FontWeight.Normal,
            )
        }
    }
}
