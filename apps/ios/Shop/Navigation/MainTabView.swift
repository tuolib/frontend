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
                ProfilePlaceholderView(
                    isLoggedIn: isLoggedIn,
                    onSignInTapped: { showLoginSheet = true }
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

    @ViewBuilder
    private func routeView(_ route: AppRoute) -> some View {
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
                },
                onBuyNow: {
                    appendRoute(.orderCreate)
                }
            )

        case .orderCreate:
            OrderCreateView(
                store: Store(initialState: OrderCreateFeature.State()) {
                    OrderCreateFeature()
                },
                onPayment: { orderId in
                    appendRoute(.payment(orderId: orderId))
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
                store: Store(initialState: PaymentFeature.State(orderId: orderId)) {
                    PaymentFeature()
                },
                onComplete: { orderId in
                    appendRoute(.orderDetail(id: orderId))
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

// MARK: - Placeholder Views (replaced in later phases)

private struct ProfilePlaceholderView: View {
    let isLoggedIn: Bool
    let onSignInTapped: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "person.fill")
                .font(.system(size: 48))
                .foregroundStyle(Color.shopAccent)
            Text("You")
                .font(ShopFonts.title)
                .foregroundStyle(Color.shopText)

            if isLoggedIn {
                Text("Coming in Phase 7")
                    .font(ShopFonts.subheadline)
                    .foregroundStyle(Color.shopTextSecondary)
            } else {
                Button("Sign In") {
                    onSignInTapped()
                }
                .fontWeight(.semibold)
                .padding(.horizontal, 32)
                .padding(.vertical, 12)
                .background(Color.shopAccent)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.shopBackground)
    }
}

#Preview {
    MainTabView(
        showLoginSheet: .constant(false),
        isLoggedIn: .constant(false)
    )
}
