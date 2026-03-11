import SwiftUI
import ComposableArchitecture
import Kingfisher

struct ProfileView: View {
    @Bindable var store: StoreOf<ProfileFeature>
    let isLoggedIn: Bool
    var onSignInTapped: () -> Void
    var onOrdersTap: () -> Void
    var onAddressTap: () -> Void
    var onOrderTap: (String) -> Void
    var onLogout: () -> Void

    var body: some View {
        Group {
            if !isLoggedIn {
                signInPrompt
            } else if store.isLoading && !store.hasLoaded {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                profileContent
            }
        }
        .background(Color.shopBackground)
        .navigationTitle("You")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if isLoggedIn { store.send(.onAppear) }
        }
        .confirmationDialog(
            "Sign Out",
            isPresented: Binding(
                get: { store.showLogoutConfirm },
                set: { newValue in if !newValue { store.send(.dismissLogoutConfirmation) } }
            ),
            titleVisibility: .visible
        ) {
            Button("Sign Out", role: .destructive) {
                store.send(.confirmLogout)
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to sign out?")
        }
        .onChange(of: store.isLoggingOut) { _, isLoggingOut in
            if !isLoggingOut && store.user == nil && !store.hasLoaded {
                onLogout()
            }
        }
    }

    // MARK: - Sign In Prompt

    private var signInPrompt: some View {
        VStack(spacing: ShopDimens.spacingLG) {
            Image(systemName: "person.circle")
                .font(.system(size: 64))
                .foregroundStyle(Color.shopDivider)

            Text("Sign in to view your account")
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)

            Button {
                onSignInTapped()
            } label: {
                Text("Sign In")
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 48)
                    .padding(.vertical, 12)
                    .background(Color.shopAccent)
                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Profile Content

    private var profileContent: some View {
        ScrollView {
            VStack(spacing: ShopDimens.spacingMD) {
                // Greeting
                greetingSection

                // Quick Actions 2x2
                quickActionsGrid

                // Recent Orders
                if !store.recentOrders.isEmpty {
                    recentOrdersSection
                }
            }
            .padding(.vertical, ShopDimens.spacingMD)
        }
        .refreshable { store.send(.refresh) }
    }

    // MARK: - Greeting

    private var greetingSection: some View {
        HStack(spacing: ShopDimens.spacingMD) {
            // Avatar
            if let avatarUrl = store.user?.avatarUrl, let url = URL(string: avatarUrl) {
                KFImage(url)
                    .placeholder {
                        avatarPlaceholder
                    }
                    .resizable()
                    .scaledToFill()
                    .frame(width: 56, height: 56)
                    .clipShape(Circle())
            } else {
                avatarPlaceholder
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Hello, \(store.user?.displayName ?? "User")")
                    .font(ShopFonts.title3)
                    .foregroundStyle(Color.shopText)

                Text(store.user?.email ?? "")
                    .font(ShopFonts.caption)
                    .foregroundStyle(Color.shopTextSecondary)
            }

            Spacer()
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    private var avatarPlaceholder: some View {
        Circle()
            .fill(Color.shopTeal.opacity(0.15))
            .frame(width: 56, height: 56)
            .overlay {
                Text(String((store.user?.displayName ?? "U").prefix(1)).uppercased())
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundStyle(Color.shopTeal)
            }
    }

    // MARK: - Quick Actions Grid

    private var quickActionsGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: ShopDimens.spacingMD), count: 2)
        return LazyVGrid(columns: columns, spacing: ShopDimens.spacingMD) {
            quickActionCard(icon: "bag", title: "Orders", color: .shopTeal) {
                onOrdersTap()
            }
            quickActionCard(icon: "mappin.circle", title: "Addresses", color: .orange) {
                onAddressTap()
            }
            quickActionCard(icon: "person.circle", title: "Account", color: .blue) {
                // Future: account settings
            }
            quickActionCard(icon: "rectangle.portrait.and.arrow.right", title: "Sign Out", color: .shopTextSecondary) {
                store.send(.showLogoutConfirmation)
            }
        }
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    private func quickActionCard(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: ShopDimens.spacingSM) {
                Image(systemName: icon)
                    .font(.system(size: 28))
                    .foregroundStyle(color)

                Text(title)
                    .font(ShopFonts.captionSemibold)
                    .foregroundStyle(Color.shopText)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, ShopDimens.spacingLG)
            .background(Color.shopCard)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Recent Orders

    private var recentOrdersSection: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            HStack {
                Text("Your Orders")
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(Color.shopText)
                Spacer()
                Button {
                    onOrdersTap()
                } label: {
                    Text("See all")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTeal)
                }
            }
            .padding(.horizontal, ShopDimens.spacingMD)

            ForEach(store.recentOrders) { order in
                Button {
                    onOrderTap(order.id)
                } label: {
                    recentOrderRow(order)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func recentOrderRow(_ order: OrderSummary) -> some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            HStack {
                Text("#\(order.orderNo)")
                    .font(ShopFonts.caption)
                    .foregroundStyle(Color.shopTextSecondary)
                Spacer()
                Text(order.orderStatus.title)
                    .font(ShopFonts.captionSemibold)
                    .foregroundStyle(order.orderStatus.color)
            }

            if let firstItem = order.firstItem {
                HStack(spacing: ShopDimens.spacingSM) {
                    KFImage(URL(string: firstItem.imageUrl ?? ""))
                        .placeholder {
                            Color.shopBackground
                                .overlay {
                                    Image(systemName: "photo")
                                        .foregroundStyle(Color.shopDivider)
                                }
                        }
                        .resizable()
                        .scaledToFill()
                        .frame(width: 48, height: 48)
                        .clipped()
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(firstItem.productTitle)
                            .font(ShopFonts.caption)
                            .foregroundStyle(Color.shopText)
                            .lineLimit(1)
                        HStack {
                            PriceText(order.payAmountValue, size: .small)
                            if order.itemCount > 1 {
                                Text("\(order.itemCount) items")
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopTextSecondary)
                            }
                        }
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Color.shopDivider)
                }
            }
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }
}
