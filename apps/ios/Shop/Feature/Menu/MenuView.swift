import SwiftUI
import ComposableArchitecture
import Kingfisher

struct MenuView: View {
    @Bindable var store: StoreOf<MenuFeature>
    var onCategoryTap: (String, String) -> Void

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
            .background(Color.shopBackground)

            Divider()

            // Right panel — subcategories grid
            ScrollView {
                if store.subcategories.isEmpty {
                    EmptyStateView(
                        icon: "square.grid.2x2",
                        title: "No subcategories"
                    )
                } else {
                    let columns = Array(repeating: GridItem(.flexible(), spacing: ShopDimens.gridSpacing), count: 3)
                    LazyVGrid(columns: columns, spacing: ShopDimens.spacingLG) {
                        ForEach(store.subcategories) { sub in
                            subcategoryCard(sub)
                        }
                    }
                    .padding(ShopDimens.spacingLG)
                }
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

                Text(category.name)
                    .font(isSelected ? ShopFonts.subheadlineSemibold : ShopFonts.subheadline)
                    .foregroundStyle(isSelected ? Color.shopTeal : Color.shopText)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
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
                Image(systemName: categoryIcon(category.iconUrl))
                    .font(.system(size: 24))
                    .foregroundStyle(Color.shopTeal)
                    .frame(width: 48, height: 48)
                    .background(Color.shopBackground)
                    .clipShape(Circle())

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

    private func categoryIcon(_ iconUrl: String?) -> String {
        guard let key = iconUrl?.lowercased() else { return "tag.fill" }
        switch key {
        case "smartphone", "phone", "phones": return "iphone"
        case "headphones", "earphones", "earphone": return "headphones"
        case "watch", "smart-watches", "smartwatch": return "applewatch"
        case "laptop", "computer", "computers": return "laptopcomputer"
        case "tablet", "ipad": return "ipad"
        case "camera": return "camera.fill"
        case "tv", "television": return "tv.fill"
        case "speaker", "audio": return "hifispeaker.fill"
        case "gamepad", "gaming", "game": return "gamecontroller.fill"
        case "shirt", "clothing", "clothes", "fashion": return "tshirt.fill"
        case "shoe", "shoes", "footwear": return "shoe.fill"
        case "home", "furniture", "house": return "house.fill"
        case "book", "books": return "book.fill"
        case "toy", "toys", "baby": return "teddybear.fill"
        case "food", "grocery": return "cart.fill"
        case "beauty", "cosmetics": return "sparkles"
        case "sports", "fitness": return "figure.run"
        default: return "tag.fill"
        }
    }
}
