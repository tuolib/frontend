import SwiftUI

struct CategoryPills: View {
    let categories: [CategoryNode]
    var onCategoryTap: ((CategoryNode) -> Void)?

    private let rows = 2

    var body: some View {
        let columnCount = max(1, (categories.count + rows - 1) / rows)
        let gridColumns = Array(
            repeating: GridItem(.flexible(), spacing: ShopDimens.spacingSM),
            count: columnCount
        )

        LazyVGrid(columns: gridColumns, spacing: ShopDimens.spacingSM) {
            ForEach(categories) { category in
                Button {
                    onCategoryTap?(category)
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: categoryIcon(category.iconUrl))
                            .font(.system(size: 20))
                            .foregroundStyle(Color.shopTeal)
                            .frame(width: 28, height: 28)
                        Text(category.name)
                            .font(ShopFonts.caption)
                            .foregroundStyle(Color.shopText)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color.shopCard)
                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, ShopDimens.spacingLG)
    }

    private func categoryIcon(_ iconUrl: String?) -> String {
        guard let key = iconUrl?.lowercased() else { return "tag.fill" }
        switch key {
        case "smartphone", "phone", "phones":
            return "iphone"
        case "headphones", "earphones", "earphone":
            return "headphones"
        case "watch", "smart-watches", "smartwatch":
            return "applewatch"
        case "laptop", "computer", "computers":
            return "laptopcomputer"
        case "tablet", "ipad":
            return "ipad"
        case "camera":
            return "camera.fill"
        case "tv", "television":
            return "tv.fill"
        case "speaker", "audio":
            return "hifispeaker.fill"
        case "gamepad", "gaming", "game":
            return "gamecontroller.fill"
        case "shirt", "clothing", "clothes", "fashion":
            return "tshirt.fill"
        case "shoe", "shoes", "footwear":
            return "shoe.fill"
        case "home", "furniture", "house":
            return "house.fill"
        case "book", "books":
            return "book.fill"
        case "toy", "toys", "baby":
            return "teddybear.fill"
        case "food", "grocery":
            return "cart.fill"
        case "beauty", "cosmetics":
            return "sparkles"
        case "sports", "fitness":
            return "figure.run"
        default:
            return "tag.fill"
        }
    }
}
