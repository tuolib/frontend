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
    @State private var homeStore = Store(initialState: HomeFeature.State()) { HomeFeature() }
    @State private var cartStore = Store(initialState: CartFeature.State()) { CartFeature() }
    @State private var profileStore = Store(initialState: ProfileFeature.State()) { ProfileFeature() }
    @State private var menuStore = Store(initialState: MenuFeature.State()) { MenuFeature() }

    /// Tapping any tab (including the current one) pops it to root — Amazon pattern.
    private var tabSelection: Binding<AppTab> {
        Binding(
            get: { selectedTab },
            set: { newTab in
                if newTab == selectedTab {
                    popToRoot()
                } else {
                    resetTab(newTab)
                    selectedTab = newTab
                }
            }
        )
    }

    var body: some View {
        TabView(selection: tabSelection) {
            // Home Tab
            NavigationStack(path: $homePath) {
                HomeView(
                    store: homeStore,
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
                    store: menuStore,
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
        resetTab(selectedTab)
    }

    /// Reset a specific tab's navigation stack to root
    private func resetTab(_ tab: AppTab) {
        switch tab {
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
            StoreContainer(LoginFeature.State(), LoginFeature()) { store in
                LoginView(store: store, onDismiss: nil)
            }
        case .register:
            StoreContainer(RegisterFeature.State(), RegisterFeature()) { store in
                RegisterView(store: store)
            }
        case .search:
            StoreContainer(SearchFeature.State(), SearchFeature()) { store in
                SearchView(
                    store: store,
                    onProductTap: { id in appendRoute(.productDetail(id: id)) }
                )
            }

        case let .productList(categoryId, categoryName):
            StoreContainer(
                ProductListFeature.State(categoryId: categoryId, categoryName: categoryName),
                ProductListFeature()
            ) { store in
                ProductListView(
                    store: store,
                    onProductTap: { id in appendRoute(.productDetail(id: id)) }
                )
            }

        case let .productDetail(id):
            StoreContainer(ProductDetailFeature.State(productId: id), ProductDetailFeature()) { store in
                ProductDetailView(store: store, onCartTap: { selectedTab = .cart })
            }

        case .orderCreate:
            StoreContainer(OrderCreateFeature.State(), OrderCreateFeature()) { store in
                OrderCreateView(
                    store: store,
                    onPayment: { orderId in appendRoute(.payment(orderId: orderId)) }
                )
            }

        case .orderList:
            StoreContainer(OrderListFeature.State(), OrderListFeature()) { store in
                OrderListView(
                    store: store,
                    onOrderTap: { id in appendRoute(.orderDetail(id: id)) },
                    onPayment: { orderId in appendRoute(.payment(orderId: orderId)) }
                )
            }

        case let .orderDetail(id):
            StoreContainer(OrderDetailFeature.State(orderId: id), OrderDetailFeature()) { store in
                OrderDetailView(
                    store: store,
                    onPayment: { orderId in appendRoute(.payment(orderId: orderId)) },
                    onProductTap: { productId in appendRoute(.productDetail(id: productId)) }
                )
            }

        case let .payment(orderId):
            StoreContainer(PaymentFeature.State(orderId: orderId), PaymentFeature()) { store in
                PaymentView(
                    store: store,
                    onViewOrder: { orderId in
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
            }

        case .addressManage:
            StoreContainer(AddressFeature.State(), AddressFeature()) { store in
                AddressView(store: store)
            }
        }
    }
}

// MARK: - Generic Store Container
// Owns a TCA Store as @State so NavigationStack ViewBuilder re-evaluations
// don't recreate the Store and cancel in-flight effects.

private struct StoreContainer<R: Reducer, Content: View>: View where R.State: Equatable {
    @State private var store: StoreOf<R>
    let content: (StoreOf<R>) -> Content

    init(
        _ initialState: R.State,
        _ reducer: @autoclosure @escaping () -> R,
        @ViewBuilder content: @escaping (StoreOf<R>) -> Content
    ) {
        _store = State(initialValue: Store(initialState: initialState) { reducer() })
        self.content = content
    }

    var body: some View {
        content(store)
    }
}

#Preview {
    MainTabView(
        showLoginSheet: .constant(false),
        isLoggedIn: .constant(false)
    )
}
