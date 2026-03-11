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
                CartPlaceholderView(
                    isLoggedIn: isLoggedIn,
                    onSignInTapped: { showLoginSheet = true }
                )
                .navigationDestination(for: AppRoute.self) { route in
                    routeView(route)
                }
            }
            .tabItem { Label(AppTab.cart.title, systemImage: AppTab.cart.icon) }
            .tag(AppTab.cart)

            // Menu Tab
            NavigationStack(path: $menuPath) {
                MenuPlaceholderView()
                    .navigationDestination(for: AppRoute.self) { route in
                        routeView(route)
                    }
            }
            .tabItem { Label(AppTab.menu.title, systemImage: AppTab.menu.icon) }
            .tag(AppTab.menu)
        }
        .tint(.shopTeal)
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
        case .productList, .productDetail, .search,
             .orderCreate, .orderList, .orderDetail,
             .payment, .addressManage:
            // Placeholder for future phases
            Text("Coming soon")
                .foregroundStyle(Color.shopTextSecondary)
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

private struct CartPlaceholderView: View {
    let isLoggedIn: Bool
    let onSignInTapped: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart.fill")
                .font(.system(size: 48))
                .foregroundStyle(Color.shopAccent)

            if isLoggedIn {
                Text("Cart")
                    .font(ShopFonts.title)
                    .foregroundStyle(Color.shopText)
                Text("Coming in Phase 5")
                    .font(ShopFonts.subheadline)
                    .foregroundStyle(Color.shopTextSecondary)
            } else {
                Text("Sign in to see your cart")
                    .font(ShopFonts.body)
                    .foregroundStyle(Color.shopTextSecondary)

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
        .navigationTitle("Cart")
    }
}

private struct MenuPlaceholderView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "line.3.horizontal")
                .font(.system(size: 48))
                .foregroundStyle(Color.shopAccent)
            Text("Menu")
                .font(ShopFonts.title)
                .foregroundStyle(Color.shopText)
            Text("Coming in Phase 4")
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)
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
