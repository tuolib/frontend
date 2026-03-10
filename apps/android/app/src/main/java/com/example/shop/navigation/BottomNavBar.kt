package com.example.shop.navigation

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.shop.core.ui.theme.CardWhite
import com.example.shop.core.ui.theme.Dimens
import com.example.shop.core.ui.theme.Divider
import com.example.shop.core.ui.theme.Orange
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextSecondary

data class BottomNavItem(
    val route: Any,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
)

val bottomNavItems = listOf(
    BottomNavItem(
        route = HomeRoute,
        label = "Home",
        selectedIcon = Icons.Filled.Home,
        unselectedIcon = Icons.Outlined.Home,
    ),
    BottomNavItem(
        route = ProfileRoute,
        label = "You",
        selectedIcon = Icons.Filled.Person,
        unselectedIcon = Icons.Outlined.Person,
    ),
    BottomNavItem(
        route = CartRoute,
        label = "Cart",
        selectedIcon = Icons.Filled.ShoppingCart,
        unselectedIcon = Icons.Outlined.ShoppingCart,
    ),
    BottomNavItem(
        route = MenuRoute,
        label = "Menu",
        selectedIcon = Icons.Filled.Menu,
        unselectedIcon = Icons.Outlined.Menu,
    ),
)

@Composable
fun BottomNavBar(
    currentRoute: Any?,
    cartBadgeCount: Int,
    onItemClick: (Any) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        HorizontalDivider(thickness = 1.dp, color = Divider)
        NavigationBar(
            containerColor = CardWhite,
            tonalElevation = 0.dp,
        ) {
            bottomNavItems.forEach { item ->
                val isSelected = currentRoute == item.route
                val isCart = item.route == CartRoute

                NavigationBarItem(
                    selected = isSelected,
                    onClick = { onItemClick(item.route) },
                    icon = {
                        val icon = if (isSelected) item.selectedIcon else item.unselectedIcon
                        if (isCart && cartBadgeCount > 0) {
                            BadgedBox(
                                badge = {
                                    Badge(containerColor = Orange) {
                                        Text(
                                            text = if (cartBadgeCount > 99) "99+" else "$cartBadgeCount",
                                            fontSize = 10.sp,
                                        )
                                    }
                                },
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = item.label,
                                    modifier = Modifier.size(Dimens.BottomNavIconSize),
                                )
                            }
                        } else {
                            Icon(
                                imageVector = icon,
                                contentDescription = item.label,
                                modifier = Modifier.size(Dimens.BottomNavIconSize),
                            )
                        }
                    },
                    label = {
                        Text(text = item.label, fontSize = 12.sp)
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Teal,
                        selectedTextColor = Teal,
                        unselectedIconColor = TextSecondary,
                        unselectedTextColor = TextSecondary,
                        indicatorColor = CardWhite,
                    ),
                )
            }
        }
    }
}
