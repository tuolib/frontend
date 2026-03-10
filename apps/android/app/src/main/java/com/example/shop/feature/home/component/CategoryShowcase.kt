package com.example.shop.feature.home.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.feature.menu.data.model.CategoryNode
import com.example.shop.feature.product.data.model.ProductListItem

data class CategoryShowcaseData(
    val category: CategoryNode,
    val products: List<ProductListItem>,
)

@Composable
fun CategoryShowcase(
    showcases: List<CategoryShowcaseData>,
    onCategoryClick: (CategoryNode) -> Unit,
    onProductClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (showcases.isEmpty()) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.SpacingMd),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
    ) {
        // 2x2 grid of showcase cards
        val rows = showcases.chunked(2)
        for (row in rows) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
            ) {
                for (showcase in row) {
                    ShowcaseCard(
                        showcase = showcase,
                        onCategoryClick = { onCategoryClick(showcase.category) },
                        onProductClick = onProductClick,
                        modifier = Modifier.weight(1f),
                    )
                }
                // Fill remaining space if odd count
                if (row.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun ShowcaseCard(
    showcase: CategoryShowcaseData,
    onCategoryClick: () -> Unit,
    onProductClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .background(Color.White)
            .clickable(onClick = onCategoryClick)
            .padding(Dimens.SpacingSm),
    ) {
        Text(
            text = showcase.category.name,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
        )

        Spacer(modifier = Modifier.height(Dimens.SpacingSm))

        // 2x2 product image grid
        val products = showcase.products.take(4)
        if (products.isNotEmpty()) {
            val rows = products.chunked(2)
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                for (row in rows) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        for (product in row) {
                            AsyncImage(
                                model = product.primaryImage,
                                contentDescription = product.title,
                                modifier = Modifier
                                    .weight(1f)
                                    .aspectRatio(1f)
                                    .clip(RoundedCornerShape(Dimens.RadiusSm))
                                    .clickable { onProductClick(product.id) },
                                contentScale = ContentScale.Crop,
                            )
                        }
                        if (row.size == 1) {
                            Box(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(Dimens.SpacingSm))

        Text(
            text = "See all →",
            fontSize = 12.sp,
            color = Teal,
            fontWeight = FontWeight.SemiBold,
        )
    }
}
