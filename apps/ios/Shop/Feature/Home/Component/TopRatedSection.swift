import SwiftUI
import Kingfisher

struct TopRatedSection: View {
    let products: [Product]
    var onProductTap: ((Product) -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            HStack {
                Text("Top Rated")
                    .font(ShopFonts.title3)
                    .foregroundStyle(Color.shopText)
                Spacer()
            }
            .padding(.horizontal, ShopDimens.spacingLG)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: ShopDimens.gridSpacing) {
                    ForEach(products) { product in
                        Button {
                            onProductTap?(product)
                        } label: {
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
                                    .frame(width: 120, height: 120)
                                    .clipped()
                                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))

                                RatingStars(rating: product.avgRating, count: product.reviewCount, starSize: 10)

                                Text(product.title)
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopText)
                                    .lineLimit(1)

                                if let price = product.minPrice {
                                    PriceText(price, size: .small)
                                }
                            }
                            .frame(width: 120)
                            .padding(ShopDimens.spacingSM)
                            .background(Color.shopCard)
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                            .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, ShopDimens.spacingLG)
            }
        }
        .padding(.vertical, ShopDimens.spacingMD)
        .background(
            LinearGradient(
                colors: [Color(hex: "#FFF8E1"), Color(hex: "#FFF3CD")],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}
