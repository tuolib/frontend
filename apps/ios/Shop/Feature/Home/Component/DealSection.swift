import SwiftUI

struct DealSection: View {
    let title: String
    let products: [Product]
    var onProductTap: ((Product) -> Void)?
    var onSeeAll: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            // Section header
            HStack {
                Text(title)
                    .font(ShopFonts.title3)
                    .foregroundStyle(Color.shopText)

                Spacer()

                if let onSeeAll {
                    Button {
                        onSeeAll()
                    } label: {
                        Text("See all")
                            .font(ShopFonts.subheadline)
                            .foregroundStyle(Color.shopTeal)
                    }
                }
            }
            .padding(.horizontal, ShopDimens.spacingLG)

            // Horizontal scroll
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: ShopDimens.gridSpacing) {
                    ForEach(products) { product in
                        ProductCard(product: product) {
                            onProductTap?(product)
                        }
                        .frame(width: 150)
                    }
                }
                .padding(.horizontal, ShopDimens.spacingLG)
            }
        }
    }
}
