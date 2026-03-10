package com.example.shop.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.shop.feature.auth.login.LoginScreen
import com.example.shop.feature.auth.register.RegisterScreen
import com.example.shop.feature.home.HomeScreen

@Composable
fun AppNavGraph(
    navController: NavHostController,
    modifier: Modifier = Modifier,
) {
    NavHost(
        navController = navController,
        startDestination = HomeRoute,
        modifier = modifier,
    ) {
        // ── Tab pages ──
        composable<HomeRoute> {
            HomeScreen(
                onNavigate = { route -> navController.navigate(route) },
            )
        }
        composable<ProfileRoute> {
            PlaceholderScreen("Profile")
        }
        composable<CartRoute> {
            PlaceholderScreen("Cart")
        }
        composable<MenuRoute> {
            PlaceholderScreen("Menu")
        }

        // ── Auth pages ──
        composable<LoginRoute> {
            LoginScreen(
                onNavigateToRegister = {
                    navController.navigate(RegisterRoute)
                },
                onLoginSuccess = {
                    navController.navigate(HomeRoute) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }
        composable<RegisterRoute> {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onRegisterSuccess = {
                    navController.navigate(HomeRoute) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }

        // ── Standalone pages (placeholders for future phases) ──
        composable<SearchRoute> {
            PlaceholderScreen("Search")
        }
        composable<ProductListRoute> {
            PlaceholderScreen("Product List")
        }
        composable<ProductDetailRoute> {
            PlaceholderScreen("Product Detail")
        }
        composable<OrderCreateRoute> {
            PlaceholderScreen("Order Create")
        }
        composable<OrderListRoute> {
            PlaceholderScreen("Order List")
        }
        composable<OrderDetailRoute> {
            PlaceholderScreen("Order Detail")
        }
        composable<PaymentRoute> {
            PlaceholderScreen("Payment")
        }
        composable<AddressManageRoute> {
            PlaceholderScreen("Address Management")
        }
    }
}

@Composable
private fun PlaceholderScreen(name: String) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = name)
    }
}
