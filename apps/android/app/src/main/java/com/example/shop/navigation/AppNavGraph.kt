package com.example.shop.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.shop.feature.auth.login.LoginScreen
import com.example.shop.feature.auth.register.RegisterScreen
import com.example.shop.feature.cart.CartScreen
import com.example.shop.feature.home.HomeScreen
import com.example.shop.feature.menu.MenuScreen
import com.example.shop.feature.order.create.OrderCreateScreen
import com.example.shop.feature.order.detail.OrderDetailScreen
import com.example.shop.feature.order.list.OrderListScreen
import com.example.shop.feature.order.payment.PaymentScreen
import com.example.shop.feature.product.detail.ProductDetailScreen
import com.example.shop.feature.product.list.ProductListScreen
import com.example.shop.feature.product.search.SearchScreen
import com.example.shop.feature.user.address.AddressScreen
import com.example.shop.feature.user.profile.ProfileScreen

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
            ProfileScreen(
                onNavigateToLogin = {
                    navController.navigate(LoginRoute)
                },
                onNavigateToOrders = {
                    navController.navigate(OrderListRoute)
                },
                onNavigateToAddress = {
                    navController.navigate(AddressManageRoute)
                },
                onNavigateToOrderDetail = { orderId ->
                    navController.navigate(OrderDetailRoute(orderId))
                },
                onLogoutSuccess = {
                    navController.navigate(HomeRoute) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }
        composable<CartRoute> {
            CartScreen(
                onNavigateToLogin = {
                    navController.navigate(LoginRoute)
                },
                onNavigateToCheckout = {
                    navController.navigate(OrderCreateRoute)
                },
                onNavigateToProduct = { productId ->
                    navController.navigate(ProductDetailRoute(productId))
                },
            )
        }
        composable<MenuRoute> {
            MenuScreen(
                onCategoryClick = { categoryId, categoryName ->
                    navController.navigate(
                        ProductListRoute(
                            categoryId = categoryId,
                            categoryName = categoryName,
                        )
                    )
                },
            )
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

        // ── Standalone pages ──
        composable<SearchRoute> {
            SearchScreen(
                onBack = { navController.popBackStack() },
                onProductClick = { id ->
                    navController.navigate(ProductDetailRoute(id))
                },
            )
        }
        composable<ProductListRoute> {
            ProductListScreen(
                onBack = { navController.popBackStack() },
                onProductClick = { id ->
                    navController.navigate(ProductDetailRoute(id))
                },
            )
        }
        composable<ProductDetailRoute> {
            ProductDetailScreen(
                onBack = { navController.popBackStack() },
                onNavigateToCart = {
                    navController.navigate(CartRoute) {
                        popUpTo(HomeRoute) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
            )
        }

        // ── Order pages ──
        composable<OrderCreateRoute> {
            OrderCreateScreen(
                onBack = { navController.popBackStack() },
                onNavigateToPayment = { orderId ->
                    navController.navigate(PaymentRoute(orderId)) {
                        popUpTo(CartRoute) { inclusive = false }
                    }
                },
                onNavigateToAddressManage = {
                    navController.navigate(AddressManageRoute)
                },
            )
        }
        composable<OrderListRoute> {
            OrderListScreen(
                onBack = { navController.popBackStack() },
                onOrderClick = { orderId ->
                    navController.navigate(OrderDetailRoute(orderId))
                },
            )
        }
        composable<OrderDetailRoute> {
            OrderDetailScreen(
                onBack = { navController.popBackStack() },
                onNavigateToPayment = { orderId ->
                    navController.navigate(PaymentRoute(orderId))
                },
            )
        }
        composable<PaymentRoute> {
            PaymentScreen(
                onBack = { navController.popBackStack() },
                onNavigateToOrderDetail = { orderId ->
                    navController.navigate(OrderDetailRoute(orderId)) {
                        popUpTo(HomeRoute) { saveState = true }
                    }
                },
                onNavigateToHome = {
                    navController.navigate(HomeRoute) {
                        popUpTo(HomeRoute) { inclusive = true }
                    }
                },
            )
        }
        composable<AddressManageRoute> {
            AddressScreen(
                onBack = { navController.popBackStack() },
            )
        }
    }
}
