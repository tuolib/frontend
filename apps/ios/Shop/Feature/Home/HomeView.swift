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

                // Category pills
                if !store.categories.isEmpty {
                    CategoryPills(categories: store.categories) { category in
                        onCategoryTap(category.id, category.name)
                    }
                }

                // Banner
                if !store.banners.isEmpty {
                    BannerCarousel(banners: store.banners) { banner in
                        handleBannerTap(banner)
                    }
                    .padding(.horizontal, ShopDimens.spacingLG)
                }

                // Deal of the Day
                if !store.deals.isEmpty {
                    DealSection(
                        title: "Deal of the Day",
                        products: store.deals,
                        onProductTap: { onProductTap($0.id) }
                    )
                }

                // Category showcase
                if !store.categories.isEmpty {
                    CategoryShowcase(categories: store.categories) { category in
                        onCategoryTap(category.id, category.name)
                    }
                }

                // New Arrivals
                if !store.newArrivals.isEmpty {
                    NewArrivalsSection(products: store.newArrivals) { product in
                        onProductTap(product.id)
                    }
                }

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
