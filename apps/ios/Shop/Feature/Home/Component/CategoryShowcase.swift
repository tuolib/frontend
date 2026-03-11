import SwiftUI
import Kingfisher

struct CategoryShowcase: View {
    let categories: [CategoryNode]
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
                        VStack(spacing: 8) {
                            if let iconUrl = category.iconUrl, let url = URL(string: iconUrl) {
                                KFImage(url)
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(height: 60)
                            } else {
                                Image(systemName: "square.grid.2x2.fill")
                                    .font(.system(size: 32))
                                    .foregroundStyle(Color.shopTeal)
                                    .frame(height: 60)
                            }

                            Text(category.name)
                                .font(ShopFonts.subheadlineSemibold)
                                .foregroundStyle(Color.shopText)
                                .lineLimit(1)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, ShopDimens.spacingLG)
                        .background(Color.shopCard)
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, ShopDimens.spacingLG)
        }
    }
}
