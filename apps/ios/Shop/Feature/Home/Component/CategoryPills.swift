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
                        Image(systemName: CategoryIconMapper.icon(for: category.slug))
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
}
