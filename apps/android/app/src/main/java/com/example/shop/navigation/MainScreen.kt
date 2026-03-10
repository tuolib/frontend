package com.example.shop.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController

// Routes that show the bottom navigation bar
private val tabRoutes = setOf(
    HomeRoute::class,
    ProfileRoute::class,
    CartRoute::class,
    MenuRoute::class,
)

@Composable
fun MainScreen(
    navController: NavHostController = rememberNavController(),
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val showBottomBar = currentDestination?.let { dest ->
        tabRoutes.any { dest.hasRoute(it) }
    } ?: false

    val currentTabRoute: Any? = tabRoutes.firstOrNull { route ->
        currentDestination?.hasRoute(route) == true
    }?.let { routeClass ->
        when (routeClass) {
            HomeRoute::class -> HomeRoute
            ProfileRoute::class -> ProfileRoute
            CartRoute::class -> CartRoute
            MenuRoute::class -> MenuRoute
            else -> null
        }
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(
                    currentRoute = currentTabRoute,
                    cartBadgeCount = 0, // TODO: connect to cart store in Phase 5
                    onItemClick = { route ->
                        navController.navigate(route) {
                            // Pop up to the start destination to avoid building up a stack
                            popUpTo(HomeRoute) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
        },
    ) { innerPadding ->
        AppNavGraph(
            navController = navController,
            modifier = Modifier.padding(innerPadding),
        )
    }
}
