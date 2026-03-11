import SwiftUI
import ComposableArchitecture

struct MainTabView: View {
    @Binding var showLoginSheet: Bool
    @Binding var isLoggedIn: Bool

    @State private var selectedTab: AppTab = .home
    @State private var homePath = NavigationPath()
    @State private var profilePath = NavigationPath()
    @State private var cartPath = NavigationPath()
    @State private var menuPath = NavigationPath()
    @State private var cartStore = Store(initialState: CartFeature.State()) { CartFeature() }
    @State private var profileStore = Store(initialState: ProfileFeature.State()) { ProfileFeature() }
    @State private var pendingPaymentOrder: Order?

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            NavigationStack(path: $homePath) {
                HomeView(
                    store: Store(initialState: HomeFeature.State()) {
                        HomeFeature()
                    },
                    onSearchTap: {
                        homePath.append(AppRoute.search)
                    },
                    onCategoryTap: { id, name in
                        homePath.append(AppRoute.productList(categoryId: id, categoryName: name))
                    },
                    onProductTap: { id in
                        homePath.append(AppRoute.productDetail(id: id))
                    }
                )
                .navigationDestination(for: AppRoute.self) { route in
                    routeView(route)
                }
            }
            .tabItem { Label(AppTab.home.title, systemImage: AppTab.home.icon) }
            .tag(AppTab.home)

            // Profile Tab
            NavigationStack(path: $profilePath) {
                ProfileView(
                    store: profileStore,
                    isLoggedIn: isLoggedIn,
                    onSignInTapped: { showLoginSheet = true },
                    onOrdersTap: {
                        profilePath.append(AppRoute.orderList)
                    },
                    onAddressTap: {
                        profilePath.append(AppRoute.addressManage)
                    },
                    onOrderTap: { id in
                        profilePath.append(AppRoute.orderDetail(id: id))
                    },
                    onLogout: {
                        isLoggedIn = false
                        selectedTab = .home
                    }
                )
                .navigationDestination(for: AppRoute.self) { route in
                    routeView(route)
                }
            }
            .tabItem { Label(AppTab.profile.title, systemImage: AppTab.profile.icon) }
            .tag(AppTab.profile)

            // Cart Tab
            NavigationStack(path: $cartPath) {
                CartView(
                    store: cartStore,
                    isLoggedIn: isLoggedIn,
                    onSignInTapped: { showLoginSheet = true },
                    onProductTap: { id in
                        cartPath.append(AppRoute.productDetail(id: id))
                    },
                    onCheckout: {
                        cartPath.append(AppRoute.orderCreate)
                    }
                )
                .navigationDestination(for: AppRoute.self) { route in
                    routeView(route)
                }
            }
            .tabItem { Label(AppTab.cart.title, systemImage: AppTab.cart.icon) }
            .tag(AppTab.cart)

            // Menu Tab
            NavigationStack(path: $menuPath) {
                MenuView(
                    store: Store(initialState: MenuFeature.State()) {
                        MenuFeature()
                    },
                    onCategoryTap: { id, name in
                        menuPath.append(AppRoute.productList(categoryId: id, categoryName: name))
                    },
                    onProductTap: { id in
                        menuPath.append(AppRoute.productDetail(id: id))
                    }
                )
                .navigationDestination(for: AppRoute.self) { route in
                    routeView(route)
                }
            }
            .tabItem { Label(AppTab.menu.title, systemImage: AppTab.menu.icon) }
            .tag(AppTab.menu)
        }
        .tint(.shopTeal)
    }

    private func appendRoute(_ route: AppRoute) {
        switch selectedTab {
        case .home: homePath.append(route)
        case .profile: profilePath.append(route)
        case .cart: cartPath.append(route)
        case .menu: menuPath.append(route)
        }
    }

    /// Replace the current (last) route with a new one
    private func replaceLastRoute(with route: AppRoute) {
        switch selectedTab {
        case .home:
            if !homePath.isEmpty { homePath.removeLast() }
            homePath.append(route)
        case .profile:
            if !profilePath.isEmpty { profilePath.removeLast() }
            profilePath.append(route)
        case .cart:
            if !cartPath.isEmpty { cartPath.removeLast() }
            cartPath.append(route)
        case .menu:
            if !menuPath.isEmpty { menuPath.removeLast() }
            menuPath.append(route)
        }
    }

    /// Pop to root of the current tab
    private func popToRoot() {
        switch selectedTab {
        case .home: homePath = NavigationPath()
        case .profile: profilePath = NavigationPath()
        case .cart: cartPath = NavigationPath()
        case .menu: menuPath = NavigationPath()
        }
    }

    @ViewBuilder
    private func routeView(_ route: AppRoute) -> some View {
        routeContent(route)
            .toolbar(.hidden, for: .tabBar)
    }

    @ViewBuilder
    private func routeContent(_ route: AppRoute) -> some View {
        switch route {
        case .login:
            LoginView(
                store: Store(initialState: LoginFeature.State()) {
                    LoginFeature()
                },
                onDismiss: nil
            )
        case .register:
            RegisterView(
                store: Store(initialState: RegisterFeature.State()) {
                    RegisterFeature()
                }
            )
        case .search:
            SearchView(
                store: Store(initialState: SearchFeature.State()) {
                    SearchFeature()
                },
                onProductTap: { id in
                    appendRoute(.productDetail(id: id))
                }
            )

        case let .productList(categoryId, categoryName):
            ProductListView(
                store: Store(initialState: ProductListFeature.State(
                    categoryId: categoryId,
                    categoryName: categoryName
                )) {
                    ProductListFeature()
                },
                onProductTap: { id in
                    appendRoute(.productDetail(id: id))
                }
            )

        case let .productDetail(id):
            ProductDetailView(
                store: Store(initialState: ProductDetailFeature.State(productId: id)) {
                    ProductDetailFeature()
                },
                onCartTap: {
                    selectedTab = .cart
                }
            )

        case .orderCreate:
            OrderCreateView(
                store: Store(initialState: OrderCreateFeature.State()) {
                    OrderCreateFeature()
                },
                onPayment: { order in
                    pendingPaymentOrder = order
                    appendRoute(.payment(orderId: order.orderId))
                }
            )

        case .orderList:
            OrderListView(
                store: Store(initialState: OrderListFeature.State()) {
                    OrderListFeature()
                },
                onOrderTap: { id in
                    appendRoute(.orderDetail(id: id))
                },
                onPayment: { orderId in
                    appendRoute(.payment(orderId: orderId))
                }
            )

        case let .orderDetail(id):
            OrderDetailView(
                store: Store(initialState: OrderDetailFeature.State(orderId: id)) {
                    OrderDetailFeature()
                },
                onPayment: { orderId in
                    appendRoute(.payment(orderId: orderId))
                },
                onProductTap: { productId in
                    appendRoute(.productDetail(id: productId))
                }
            )

        case let .payment(orderId):
            PaymentView(
                store: Store(initialState: PaymentFeature.State(
                    orderId: orderId,
                    order: pendingPaymentOrder?.orderId == orderId ? pendingPaymentOrder : nil
                )) {
                    PaymentFeature()
                },
                onViewOrder: { orderId in
                    // Pop to root, switch to profile tab, navigate to order detail
                    popToRoot()
                    selectedTab = .profile
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        profilePath.append(AppRoute.orderDetail(id: orderId))
                    }
                },
                onContinueShopping: {
                    popToRoot()
                    selectedTab = .home
                }
            )

        case .addressManage:
            AddressView(
                store: Store(initialState: AddressFeature.State()) {
                    AddressFeature()
                }
            )
        }
    }
}

#Preview {
    MainTabView(
        showLoginSheet: .constant(false),
        isLoggedIn: .constant(false)
    )
}
