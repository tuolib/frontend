import SwiftUI
import ComposableArchitecture
import Kingfisher

struct MenuView: View {
    @Bindable var store: StoreOf<MenuFeature>
    var onCategoryTap: (String, String) -> Void
    var onProductTap: (String) -> Void

    var body: some View {
        Group {
            if store.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                menuContent
            }
        }
        .background(Color.shopBackground)
        .navigationTitle("Categories")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { store.send(.onAppear) }
    }

    private var menuContent: some View {
        HStack(spacing: 0) {
            // Left panel — primary categories
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(store.categories) { category in
                        categoryTab(category)
                    }
                }
            }
            .frame(width: 88)
            .background(Color(hex: "#F5F5F5"))

            // Right panel — subcategories + popular
            ScrollView {
                if store.subcategories.isEmpty {
                    EmptyStateView(
                        icon: "square.grid.2x2",
                        title: "No subcategories"
                    )
                } else {
                    VStack(spacing: ShopDimens.spacingLG) {
                        // Subcategory grid
                        subcategoryGrid

                        // Popular products
                        if !store.popularProducts.isEmpty {
                            popularSection
                        } else if store.isLoadingPopular {
                            ProgressView()
                                .tint(Color.shopTeal)
                                .frame(maxWidth: .infinity)
                                .padding()
                        }

                        // See all button
                        if let cat = store.selectedCategory {
                            Button {
                                onCategoryTap(cat.id, cat.name)
                            } label: {
                                Text("See all in \(cat.name)")
                                    .font(ShopFonts.subheadlineSemibold)
                                    .foregroundStyle(Color.shopTeal)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, ShopDimens.spacingMD)
                                    .background(Color.shopCard)
                                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: ShopDimens.radiusMD)
                                            .stroke(Color.shopTeal, lineWidth: 1)
                                    )
                            }
                            .padding(.horizontal, ShopDimens.spacingMD)
                        }
                    }
                    .padding(.vertical, ShopDimens.spacingMD)
                }
            }
            .background(Color.shopCard)
        }
    }

    // MARK: - Subcategory Grid

    private var subcategoryGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: ShopDimens.spacingSM), count: 3)
        return LazyVGrid(columns: columns, spacing: ShopDimens.spacingLG) {
            ForEach(store.subcategories) { sub in
                subcategoryCard(sub)
            }
        }
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Popular Section

    private var popularSection: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            Text("Popular")
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(Color.shopText)
                .padding(.horizontal, ShopDimens.spacingMD)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: ShopDimens.spacingSM) {
                    ForEach(store.popularProducts) { product in
                        Button {
                            onProductTap(product.id)
                        } label: {
                            popularProductCard(product)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, ShopDimens.spacingMD)
            }
        }
    }

    // MARK: - Left Tab

    private func categoryTab(_ category: CategoryNode) -> some View {
        let isSelected = category.id == store.selectedId
        return Button {
            store.send(.selectCategory(category.id))
        } label: {
            HStack(spacing: 0) {
                // Selected indicator
                RoundedRectangle(cornerRadius: 2)
                    .fill(isSelected ? Color.shopTeal : Color.clear)
                    .frame(width: 3, height: 24)

                VStack(spacing: 4) {
                    Text(CategoryEmojiMapper.emoji(for: category.slug))
                        .font(.system(size: 22))

                    Text(category.name)
                        .font(isSelected ? ShopFonts.captionSemibold : ShopFonts.caption)
                        .foregroundStyle(isSelected ? Color.shopTeal : Color.shopTextSecondary)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, ShopDimens.spacingMD)
            }
            .background(isSelected ? Color.shopCard : Color.clear)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Right Card

    private func subcategoryCard(_ category: CategoryNode) -> some View {
        Button {
            onCategoryTap(category.id, category.name)
        } label: {
            VStack(spacing: 6) {
                ZStack {
                    Circle()
                        .fill(Color(hex: "#F0F0F0"))
                        .frame(width: 56, height: 56)

                    Text(CategoryEmojiMapper.emoji(for: category.slug))
                        .font(.system(size: 24))
                }

                Text(category.name)
                    .font(ShopFonts.caption)
                    .foregroundStyle(Color.shopText)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Popular Product Card

    private func popularProductCard(_ product: Product) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            KFImage(URL(string: product.primaryImage ?? ""))
                .placeholder {
                    Color.shopBackground
                        .overlay {
                            Image(systemName: "photo")
                                .foregroundStyle(Color.shopDivider)
                        }
                }
                .resizable()
                .scaledToFill()
                .frame(width: 80, height: 80)
                .clipped()
                .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))

            Text(product.title)
                .font(.system(size: 11))
                .foregroundStyle(Color.shopText)
                .lineLimit(2)

            if let price = product.minPrice {
                PriceText(price, size: .small)
            }
        }
        .frame(width: 100)
    }
}
