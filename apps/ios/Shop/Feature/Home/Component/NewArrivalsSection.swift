import SwiftUI
import Kingfisher

struct NewArrivalsSection: View {
    let products: [Product]
    var onProductTap: ((Product) -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            HStack {
                Text("New Arrivals")
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
                                ZStack(alignment: .topLeading) {
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
                                        .frame(width: 130, height: 160)
                                        .clipped()
                                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))

                                    Text("NEW")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 3)
                                        .background(Color.shopTeal)
                                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                                        .padding(6)
                                }

                                Text(product.title)
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopText)
                                    .lineLimit(2)

                                if let price = product.minPrice {
                                    PriceText(price, size: .small)
                                }
                            }
                            .frame(width: 130)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, ShopDimens.spacingLG)
            }
        }
    }
}
