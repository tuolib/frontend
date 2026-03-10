package com.example.shop.feature.menu

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.feature.menu.data.model.CategoryNode

@Composable
fun MenuScreen(
    onCategoryClick: (categoryId: String, categoryName: String) -> Unit,
    viewModel: MenuViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    if (state.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator(color = Teal)
        }
        return
    }

    if (state.categories.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "No categories",
                fontSize = 16.sp,
                color = TextSecondary,
            )
        }
        return
    }

    Row(modifier = Modifier.fillMaxSize()) {
        // Left: primary category list
        LazyColumn(
            modifier = Modifier
                .width(88.dp)
                .fillMaxHeight()
                .background(Color(0xFFF5F5F5)),
        ) {
            itemsIndexed(state.categories) { index, category ->
                val isSelected = index == state.selectedIndex
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.onSelectCategory(index) }
                        .background(if (isSelected) Color.White else Color.Transparent),
                ) {
                    // Left teal indicator
                    if (isSelected) {
                        Box(
                            modifier = Modifier
                                .width(3.dp)
                                .height(32.dp)
                                .background(Teal)
                                .align(Alignment.CenterStart),
                        )
                    }

                    Text(
                        text = category.name,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = Dimens.SpacingLg, horizontal = Dimens.SpacingSm),
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) TextPrimary else TextSecondary,
                        textAlign = TextAlign.Center,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }

        // Right: subcategories grid
        val selectedCategory = state.categories.getOrNull(state.selectedIndex)

        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight()
                .background(Color.White)
                .padding(Dimens.SpacingMd),
        ) {
            if (selectedCategory != null && selectedCategory.children.isNotEmpty()) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = Dimens.SpacingSm),
                    horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                    verticalArrangement = Arrangement.spacedBy(Dimens.SpacingLg),
                ) {
                    items(selectedCategory.children) { child ->
                        SubcategoryItem(
                            category = child,
                            onClick = { onCategoryClick(child.id, child.name) },
                        )
                    }
                }

                // "See all" button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(Dimens.RadiusMd))
                        .background(Color(0xFFF5F5F5))
                        .clickable {
                            onCategoryClick(
                                selectedCategory.id,
                                selectedCategory.name,
                            )
                        }
                        .padding(Dimens.SpacingMd),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = "See all ${selectedCategory.name}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Teal,
                    )
                    Spacer(modifier = Modifier.width(Dimens.SpacingXs))
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = Teal,
                    )
                }
            } else if (selectedCategory != null) {
                // No children, show "See all" directly
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Browse all products in",
                            fontSize = 14.sp,
                            color = TextSecondary,
                        )
                        Spacer(modifier = Modifier.height(Dimens.SpacingSm))
                        Text(
                            text = selectedCategory.name,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                        )
                        Spacer(modifier = Modifier.height(Dimens.SpacingLg))
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(Dimens.RadiusMd))
                                .background(Teal)
                                .clickable {
                                    onCategoryClick(
                                        selectedCategory.id,
                                        selectedCategory.name,
                                    )
                                }
                                .padding(
                                    horizontal = Dimens.SpacingXl,
                                    vertical = Dimens.SpacingMd,
                                ),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(
                                text = "See all",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SubcategoryItem(
    category: CategoryNode,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(Dimens.RadiusMd))
            .clickable(onClick = onClick)
            .padding(Dimens.SpacingXs),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        if (category.iconUrl != null) {
            AsyncImage(
                model = category.iconUrl,
                contentDescription = category.name,
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(Dimens.RadiusMd)),
                contentScale = ContentScale.Crop,
            )
        } else {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(Dimens.RadiusMd))
                    .background(Color(0xFFF0F0F0)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = category.name.take(1),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Teal,
                )
            }
        }

        Spacer(modifier = Modifier.height(Dimens.SpacingXs))

        Text(
            text = category.name,
            fontSize = 12.sp,
            color = TextPrimary,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
