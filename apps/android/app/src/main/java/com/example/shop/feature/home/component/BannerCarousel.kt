package com.example.shop.feature.home.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Teal
import com.example.shop.feature.home.data.model.Banner
import kotlinx.coroutines.delay

@Composable
fun BannerCarousel(
    banners: List<Banner>,
    onBannerClick: (Banner) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (banners.isEmpty()) return

    val pagerState = rememberPagerState(pageCount = { banners.size })

    // Auto-scroll every 3 seconds
    LaunchedEffect(pagerState, banners.size) {
        while (true) {
            delay(3000)
            val next = (pagerState.currentPage + 1) % banners.size
            pagerState.animateScrollToPage(next)
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.SpacingMd),
    ) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
                .clip(RoundedCornerShape(Dimens.RadiusMd)),
        ) { page ->
            val banner = banners[page]
            AsyncImage(
                model = banner.imageUrl,
                contentDescription = banner.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(Dimens.RadiusMd)),
                contentScale = ContentScale.Crop,
            )
        }

        // Dot indicators
        if (banners.size > 1) {
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                repeat(banners.size) { index ->
                    Box(
                        modifier = Modifier
                            .size(if (index == pagerState.currentPage) 8.dp else 6.dp)
                            .clip(CircleShape)
                            .background(
                                if (index == pagerState.currentPage) Teal
                                else Color.White.copy(alpha = 0.7f)
                            ),
                    )
                }
            }
        }
    }
}
