import SwiftUI
import Kingfisher

struct CategoryShowcase: View {
    let categories: [CategoryNode]
    let categoryProducts: [String: [Product]]
    var onCategoryTap: ((CategoryNode) -> Void)?

    private let columns = Array(
        repeating: GridItem(.flexible(), spacing: ShopDimens.gridSpacing),
        count: 2
    )

    var body: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            Text("Shop by Category")
                .font(ShopFonts.title3)
                .foregroundStyle(Color.shopText)
                .padding(.horizontal, ShopDimens.spacingLG)

            LazyVGrid(columns: columns, spacing: ShopDimens.gridSpacing) {
                ForEach(categories.prefix(4)) { category in
                    Button {
                        onCategoryTap?(category)
                    } label: {
                        categoryCard(category)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, ShopDimens.spacingLG)
        }
    }

    private func categoryCard(_ category: CategoryNode) -> some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            // Header: icon + name + "See more"
            HStack(spacing: 6) {
                Image(systemName: CategoryIconMapper.icon(for: category.slug))
                    .font(.system(size: 14))
                    .foregroundStyle(Color.shopTeal)
                Text(category.name)
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(Color.shopText)
                    .lineLimit(1)
            }

            // 2x2 product images
            let products = categoryProducts[category.id] ?? []
            let imageColumns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 2)
            LazyVGrid(columns: imageColumns, spacing: 4) {
                ForEach(0..<4, id: \.self) { index in
                    if index < products.count {
                        KFImage(URL(string: products[index].primaryImage ?? ""))
                            .placeholder {
                                Color.shopBackground
                            }
                            .resizable()
                            .scaledToFill()
                            .frame(minHeight: 60)
                            .aspectRatio(1, contentMode: .fit)
                            .clipped()
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                    } else {
                        Color.shopBackground
                            .aspectRatio(1, contentMode: .fit)
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                    }
                }
            }

            // "See more" link
            Text("See more")
                .font(ShopFonts.caption)
                .foregroundStyle(Color.shopTeal)
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
    }
}
