package com.example.shop.feature.product.search

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.LoadState
import androidx.paging.compose.collectAsLazyPagingItems
import com.example.shop.core.ui.component.EmptyState
import com.example.shop.core.ui.component.ProductGrid
import com.example.shop.core.ui.component.SortBar
import com.example.shop.core.ui.component.SortOption
import com.example.shop.core.ui.theme.DarkNavy
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary

private val searchSortOptions = listOf(
    SortOption("Relevance", "relevance", ""),
    SortOption("Price ↑", "price_asc", ""),
    SortOption("Price ↓", "price_desc", ""),
    SortOption("Sales", "sales", ""),
    SortOption("Newest", "newest", ""),
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SearchScreen(
    onBack: () -> Unit,
    onProductClick: (String) -> Unit,
    viewModel: SearchViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val history by viewModel.history.collectAsStateWithLifecycle()
    val searchResults = viewModel.searchResults.collectAsLazyPagingItems()
    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5)),
    ) {
        // Search bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkNavy)
                .padding(horizontal = Dimens.SpacingSm, vertical = Dimens.SpacingSm),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = Color.White,
                )
            }

            BasicTextField(
                value = state.query,
                onValueChange = viewModel::onQueryChange,
                modifier = Modifier
                    .weight(1f)
                    .height(40.dp)
                    .clip(RoundedCornerShape(Dimens.RadiusMd))
                    .background(Color.White)
                    .focusRequester(focusRequester),
                singleLine = true,
                textStyle = androidx.compose.ui.text.TextStyle(
                    fontSize = 14.sp,
                    color = TextPrimary,
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(
                    onSearch = {
                        viewModel.onSearch()
                        keyboardController?.hide()
                    },
                ),
                cursorBrush = SolidColor(Teal),
                decorationBox = { innerTextField ->
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = Dimens.SpacingMd),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp),
                            tint = Teal,
                        )
                        Spacer(modifier = Modifier.width(Dimens.SpacingSm))
                        Box(modifier = Modifier.weight(1f)) {
                            if (state.query.isEmpty()) {
                                Text(
                                    text = "Search products...",
                                    fontSize = 14.sp,
                                    color = TextSecondary,
                                )
                            }
                            innerTextField()
                        }
                        if (state.query.isNotEmpty()) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Clear",
                                modifier = Modifier
                                    .size(18.dp)
                                    .clickable { viewModel.onClearSearch() },
                                tint = TextSecondary,
                            )
                        }
                    }
                },
            )

            Spacer(modifier = Modifier.width(Dimens.SpacingSm))
        }

        if (state.isSearchActive) {
            // Sort bar
            SortBar(
                currentSort = state.sort,
                currentOrder = "",
                onSortChange = { sort, _ -> viewModel.onSortChange(sort) },
                options = searchSortOptions,
            )

            Spacer(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(Divider),
            )

            // Search results
            val isEmpty = searchResults.loadState.refresh is LoadState.NotLoading &&
                    searchResults.itemCount == 0

            if (isEmpty) {
                EmptyState(
                    title = "No results found",
                    subtitle = "Try different keywords",
                    icon = Icons.Default.Search,
                    modifier = Modifier.fillMaxSize(),
                )
            } else {
                ProductGrid(
                    items = searchResults,
                    onProductClick = onProductClick,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        } else {
            // Search history
            if (history.isNotEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(Dimens.SpacingLg),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = "Recent Searches",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary,
                        )
                        Text(
                            text = "Clear All",
                            fontSize = 13.sp,
                            color = Teal,
                            modifier = Modifier.clickable { viewModel.onClearHistory() },
                        )
                    }

                    Spacer(modifier = Modifier.height(Dimens.SpacingMd))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                        verticalArrangement = Arrangement.spacedBy(Dimens.SpacingSm),
                    ) {
                        history.forEach { keyword ->
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(Dimens.RadiusFull))
                                    .background(Color(0xFFF0F0F0))
                                    .clickable {
                                        viewModel.onQueryChange(keyword)
                                        viewModel.onSearch(keyword)
                                        keyboardController?.hide()
                                    }
                                    .padding(
                                        start = Dimens.SpacingMd,
                                        end = Dimens.SpacingSm,
                                        top = Dimens.SpacingXs,
                                        bottom = Dimens.SpacingXs,
                                    ),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Icon(
                                    imageVector = Icons.Default.History,
                                    contentDescription = null,
                                    modifier = Modifier.size(14.dp),
                                    tint = TextSecondary,
                                )
                                Spacer(modifier = Modifier.width(Dimens.SpacingXs))
                                Text(
                                    text = keyword,
                                    fontSize = 13.sp,
                                    color = TextPrimary,
                                )
                                Spacer(modifier = Modifier.width(Dimens.SpacingXs))
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Remove",
                                    modifier = Modifier
                                        .size(14.dp)
                                        .clickable { viewModel.onRemoveHistory(keyword) },
                                    tint = TextSecondary,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
