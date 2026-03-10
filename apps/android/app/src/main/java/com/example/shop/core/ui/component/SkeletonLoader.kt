package com.example.shop.core.ui.component

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.shop.core.ui.theme.Dimens

@Composable
fun SkeletonBox(
    modifier: Modifier = Modifier,
    width: Dp? = null,
    height: Dp = 16.dp,
) {
    val transition = rememberInfiniteTransition(label = "skeleton")
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "skeleton_translate",
    )
    val shimmerBrush = Brush.linearGradient(
        colors = listOf(
            Color(0xFFEEEEEE),
            Color(0xFFDDDDDD),
            Color(0xFFEEEEEE),
        ),
        start = Offset(translateAnim - 200f, 0f),
        end = Offset(translateAnim, 0f),
    )
    Box(
        modifier = modifier
            .then(if (width != null) Modifier.width(width) else Modifier.fillMaxWidth())
            .height(height)
            .clip(RoundedCornerShape(Dimens.RadiusSm))
            .background(shimmerBrush),
    )
}

@Composable
fun ProductCardSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .background(Color.White)
            .padding(Dimens.SpacingSm),
    ) {
        SkeletonBox(height = 160.dp)
        Spacer(modifier = Modifier.height(Dimens.SpacingSm))
        SkeletonBox(height = 14.dp)
        Spacer(modifier = Modifier.height(Dimens.SpacingXs))
        SkeletonBox(height = 14.dp, width = 120.dp)
        Spacer(modifier = Modifier.height(Dimens.SpacingSm))
        SkeletonBox(height = 18.dp, width = 80.dp)
    }
}

@Composable
fun BannerSkeleton(modifier: Modifier = Modifier) {
    SkeletonBox(
        modifier = modifier.clip(RoundedCornerShape(Dimens.RadiusMd)),
        height = 180.dp,
    )
}

@Composable
fun CategoryPillsSkeleton(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth().padding(horizontal = Dimens.SpacingMd),
        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingMd),
    ) {
        repeat(5) {
            Column(horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                SkeletonBox(width = 48.dp, height = 48.dp)
                Spacer(modifier = Modifier.height(4.dp))
                SkeletonBox(width = 40.dp, height = 12.dp)
            }
        }
    }
}

@Composable
fun HorizontalCardsSkeleton(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.SpacingMd),
        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
    ) {
        repeat(3) {
            ProductCardSkeleton(modifier = Modifier.width(140.dp))
        }
    }
}
