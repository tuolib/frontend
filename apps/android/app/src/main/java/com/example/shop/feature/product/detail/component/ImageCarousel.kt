package com.example.shop.feature.product.detail.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.feature.product.data.model.ProductImage

@Composable
fun ImageCarousel(
    images: List<ProductImage>,
    modifier: Modifier = Modifier,
) {
    if (images.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(Color(0xFFF5F5F5)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "No Image",
                color = TextSecondary,
                fontSize = 14.sp,
            )
        }
        return
    }

    val pagerState = rememberPagerState(pageCount = { images.size })

    Box(modifier = modifier.fillMaxWidth()) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f),
        ) { page ->
            AsyncImage(
                model = images[page].url,
                contentDescription = images[page].altText,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        }

        // Page indicator
        if (images.size > 1) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = Dimens.SpacingMd),
            ) {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(Dimens.RadiusFull))
                        .background(Color.Black.copy(alpha = 0.5f))
                        .padding(horizontal = Dimens.SpacingSm, vertical = Dimens.SpacingXs),
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    repeat(images.size) { index ->
                        Box(
                            modifier = Modifier
                                .size(if (index == pagerState.currentPage) 8.dp else 6.dp)
                                .clip(CircleShape)
                                .background(
                                    if (index == pagerState.currentPage) Color.White
                                    else Color.White.copy(alpha = 0.5f)
                                ),
                        )
                    }
                }
            }
        }
    }
}
