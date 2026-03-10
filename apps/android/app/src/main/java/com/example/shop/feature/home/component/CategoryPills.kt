package com.example.shop.feature.home.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyHorizontalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
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
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.feature.menu.data.model.CategoryNode

// iconUrl from API is an icon name (e.g. "smartphone"), not a URL
// Map icon names to emojis for display
private val iconNameToEmoji = mapOf(
    "smartphone" to "\uD83D\uDCF1",  // 📱
    "headphones" to "\uD83C\uDFA7",  // 🎧
    "watch" to "\u231A",             // ⌚
    "laptop" to "\uD83D\uDCBB",     // 💻
    "tablet" to "\uD83D\uDCF1",     // 📱
    "keyboard" to "\u2328\uFE0F",    // ⌨️
    "refrigerator" to "\uD83E\uDDCA", // 🧊
    "fan" to "\uD83C\uDF2C\uFE0F",  // 🌬️
    "cooking-pot" to "\uD83C\uDF73", // 🍳
    "shirt" to "\uD83D\uDC55",      // 👕
    "footprints" to "\uD83D\uDC5F", // 👟
    "apple" to "\uD83C\uDF4E",      // 🍎
    "candy" to "\uD83C\uDF6C",      // 🍬
    "cup-soda" to "\uD83E\uDD64",   // 🥤
    "salad" to "\uD83E\uDD57",      // 🥗
    "sparkles" to "\u2728",          // ✨
    "droplets" to "\uD83D\uDCA7",   // 💧
    "palette" to "\uD83C\uDFA8",    // 🎨
    "bath" to "\uD83D\uDEC1",       // 🛁
    "book-open" to "\uD83D\uDCDA",  // 📚
    "graduation-cap" to "\uD83C\uDF93", // 🎓
    "image" to "\uD83D\uDDBC\uFE0F", // 🖼️
    "dumbbell" to "\uD83C\uDFCB\uFE0F", // 🏋️
    "tent" to "\u26FA",              // ⛺
    "bike" to "\uD83D\uDEB2",       // 🚲
    "baby" to "\uD83D\uDC76",       // 👶
    "toy-brick" to "\uD83E\uDDE9",  // 🧩
    "gamepad-2" to "\uD83C\uDFAE",  // 🎮
    "car" to "\uD83D\uDE97",        // 🚗
    "sofa" to "\uD83D\uDECB\uFE0F", // 🛋️
    "lamp" to "\uD83D\uDCA1",       // 💡
    "bed" to "\uD83D\uDECF\uFE0F",  // 🛏️
)

private val ROW_HEIGHT = 72.dp

@Composable
fun CategoryPills(
    categories: List<CategoryNode>,
    onCategoryClick: (CategoryNode) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyHorizontalGrid(
        rows = GridCells.Fixed(2),
        modifier = modifier.height(ROW_HEIGHT * 2 + Dimens.SpacingSm),
        contentPadding = PaddingValues(horizontal = Dimens.SpacingMd),
        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
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
        modifier = Modifier
            .width(66.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        val iconBg = Brush.linearGradient(
            colors = listOf(
                Color(0xFFF0F6F6),
                Color(0xFFE3EEEE),
            ),
        )
        val iconUrl = category.iconUrl
        if (iconUrl != null && iconUrl.startsWith("http")) {
            // Real URL — load image
            AsyncImage(
                model = iconUrl,
                contentDescription = category.name,
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(iconBg),
                contentScale = ContentScale.Crop,
            )
        } else {
            // Icon name — map to emoji
            val emoji = iconNameToEmoji[iconUrl] ?: "\uD83D\uDCE6"
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(iconBg),
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
