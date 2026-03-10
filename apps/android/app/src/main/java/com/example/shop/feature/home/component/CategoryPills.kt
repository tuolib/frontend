package com.example.shop.feature.home.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.example.shop.core.ui.theme.BackgroundGray
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.feature.menu.data.model.CategoryNode

private val categoryEmojis = mapOf(
    "electronics" to "\uD83D\uDCF1",
    "clothing" to "\uD83D\uDC55",
    "food" to "\uD83C\uDF5C",
    "beauty" to "\uD83D\uDC84",
    "home" to "\uD83C\uDFE0",
    "sports" to "\u26BD",
    "books" to "\uD83D\uDCDA",
)

@Composable
fun CategoryPills(
    categories: List<CategoryNode>,
    onCategoryClick: (CategoryNode) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyRow(
        modifier = modifier,
        contentPadding = PaddingValues(horizontal = Dimens.SpacingMd),
        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingLg),
    ) {
        items(categories, key = { it.id }) { category ->
            CategoryPillItem(
                category = category,
                onClick = { onCategoryClick(category) },
            )
        }
    }
}

@Composable
private fun CategoryPillItem(
    category: CategoryNode,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier.clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        if (category.iconUrl != null) {
            AsyncImage(
                model = category.iconUrl,
                contentDescription = category.name,
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(BackgroundGray),
                contentScale = ContentScale.Crop,
            )
        } else {
            val emoji = categoryEmojis[category.slug] ?: "\uD83D\uDCE6"
            androidx.compose.foundation.layout.Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(BackgroundGray),
                contentAlignment = Alignment.Center,
            ) {
                Text(text = emoji, fontSize = 22.sp)
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = category.name,
            fontSize = 11.sp,
            color = TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            textAlign = TextAlign.Center,
        )
    }
}
