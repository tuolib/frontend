import SwiftUI
import Kingfisher

struct ProductCard: View {
    let product: Product
    var onTap: (() -> Void)?

    var body: some View {
        Button {
            onTap?()
        } label: {
            VStack(alignment: .leading, spacing: 0) {
                // Image
                KFImage(URL(string: product.primaryImage ?? ""))
                    .placeholder {
                        Rectangle()
                            .fill(Color.shopBackground)
                            .overlay {
                                Image(systemName: "photo")
                                    .font(.system(size: 32))
                                    .foregroundStyle(Color.shopDivider)
                            }
                    }
                    .resizable()
                    .aspectRatio(1, contentMode: .fit)
                    .clipped()

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    // Title
                    Text(product.title)
                        .font(ShopFonts.subheadline)
                        .foregroundStyle(Color.shopText)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)

                    // Price
                    if let price = product.minPrice {
                        PriceText(price, size: .small)
                    }

                    // Rating + Sales
                    HStack(spacing: 4) {
                        RatingStars(rating: product.avgRating, starSize: 10)

                        if product.totalSales > 0 {
                            Text("\(product.totalSales)+ bought")
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopTextSecondary)
                        }
                    }
                }
                .padding(ShopDimens.spacingSM)
            }
            .background(Color.shopCard)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    let product = Product(
        id: "1",
        title: "iPhone 15 Pro Max 256GB Natural Titanium",
        slug: "iphone-15-pro",
        brand: "Apple",
        status: "active",
        minPrice: "7999.00",
        maxPrice: "9999.00",
        totalSales: 2000,
        avgRating: "4.5",
        reviewCount: 1500,
        primaryImage: nil,
        createdAt: "2024-01-01"
    )

    ProductCard(product: product)
        .frame(width: 180)
        .padding()
        .background(Color.shopBackground)
}
