import SwiftUI
import Kingfisher

struct CategoryPills: View {
    let categories: [CategoryNode]
    var onCategoryTap: ((CategoryNode) -> Void)?

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: ShopDimens.spacingSM) {
                ForEach(categories) { category in
                    Button {
                        onCategoryTap?(category)
                    } label: {
                        VStack(spacing: 4) {
                            if let iconUrl = category.iconUrl, let url = URL(string: iconUrl) {
                                KFImage(url)
                                    .resizable()
                                    .frame(width: 24, height: 24)
                            } else {
                                Image(systemName: "tag.fill")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Color.shopTeal)
                            }
                            Text(category.name)
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopText)
                                .lineLimit(1)
                        }
                        .frame(width: 72)
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
}
