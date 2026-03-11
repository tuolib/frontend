import SwiftUI
import ComposableArchitecture

struct HomeView: View {
    @Bindable var store: StoreOf<HomeFeature>
    var onSearchTap: () -> Void
    var onCategoryTap: (String, String) -> Void
    var onProductTap: (String) -> Void

    var body: some View {
        Group {
            if store.isLoading && !store.hasLoaded {
                HomeSkeletonView()
            } else {
                content
            }
        }
        .background(Color.shopBackground)
        .onAppear { store.send(.onAppear) }
        .refreshable { store.send(.refresh) }
    }

    private var content: some View {
        ScrollView {
            VStack(spacing: ShopDimens.spacingLG) {
                // Search bar
                searchBar

                // Category pills (2-row grid)
                if !store.categories.isEmpty {
                    CategoryPills(categories: store.categories) { category in
                        onCategoryTap(category.id, category.name)
                    }
                }

                // Banner carousel
                if !store.banners.isEmpty {
                    BannerCarousel(banners: store.banners) { banner in
                        handleBannerTap(banner)
                    }
                    .padding(.horizontal, ShopDimens.spacingLG)
                }

                // Promo banner — free shipping
                promoBanner(
                    icon: "shippingbox.fill",
                    text: "Free shipping on orders over ¥99",
                    gradient: [Color(hex: "#232F3E"), Color(hex: "#37475A")]
                )

                // Deal of the Day (with countdown)
                if !store.deals.isEmpty {
                    DealSection(
                        title: "Deal of the Day",
                        products: store.deals,
                        showCountdown: true,
                        onProductTap: { onProductTap($0.id) }
                    )
                }

                // Category showcase (with product images)
                if !store.categories.isEmpty {
                    CategoryShowcase(
                        categories: store.categories,
                        categoryProducts: store.categoryProducts
                    ) { category in
                        onCategoryTap(category.id, category.name)
                    }
                }

                // New Arrivals
                if !store.newArrivals.isEmpty {
                    NewArrivalsSection(products: store.newArrivals) { product in
                        onProductTap(product.id)
                    }
                }

                // Promo banner — returns
                promoBanner(
                    icon: "arrow.uturn.left.circle.fill",
                    text: "30-day hassle-free returns",
                    gradient: [Color(hex: "#007185"), Color(hex: "#005F73")]
                )

                // Top Rated
                if !store.topRated.isEmpty {
                    TopRatedSection(products: store.topRated) { product in
                        onProductTap(product.id)
                    }
                }

                // Recommended for You
                recommendedSection
            }
            .padding(.vertical, ShopDimens.spacingMD)
        }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        Button {
            onSearchTap()
        } label: {
            HStack(spacing: ShopDimens.spacingSM) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Color.shopTextSecondary)
                Text("Search products...")
                    .font(ShopFonts.subheadline)
                    .foregroundStyle(Color.shopTextSecondary)
                Spacer()
            }
            .padding(.horizontal, ShopDimens.spacingMD)
            .frame(height: ShopDimens.searchBarHeight)
            .background(Color.shopCard)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        }
        .buttonStyle(.plain)
        .padding(.horizontal, ShopDimens.spacingLG)
    }

    // MARK: - Promo Banner

    private func promoBanner(icon: String, text: String, gradient: [Color]) -> some View {
        HStack(spacing: ShopDimens.spacingMD) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(.white)
            Text(text)
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(.white)
            Spacer()
        }
        .padding(.horizontal, ShopDimens.spacingLG)
        .padding(.vertical, ShopDimens.spacingMD)
        .background(
            LinearGradient(colors: gradient, startPoint: .leading, endPoint: .trailing)
        )
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingLG)
    }

    // MARK: - Recommended Section

    private var recommendedSection: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            if !store.recommended.items.isEmpty {
                Text("Recommended for You")
                    .font(ShopFonts.title3)
                    .foregroundStyle(Color.shopText)
                    .padding(.horizontal, ShopDimens.spacingLG)

                ProductGrid(
                    products: store.recommended.items,
                    isLoadingMore: store.recommended.isLoadingMore,
                    hasMore: store.recommended.hasMore,
                    onLoadMore: { store.send(.loadMoreRecommended) },
                    onProductTap: { onProductTap($0.id) }
                )
                .padding(.horizontal, ShopDimens.spacingLG)
            }
        }
    }

    // MARK: - Helpers

    private func handleBannerTap(_ banner: Banner) {
        guard let linkValue = banner.linkValue else { return }
        switch banner.linkType {
        case "product":
            onProductTap(linkValue)
        case "category":
            onCategoryTap(linkValue, banner.title)
        default:
            break
        }
    }
}
