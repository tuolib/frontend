import SwiftUI

/// Price display with ¥ symbol, supports both String (product API) and Double (cart/order API)
struct PriceText: View {
    let integerPart: String
    let fractionPart: String
    let comparePrice: String?
    let discount: String?
    var size: PriceSize = .normal

    /// String price (product list/detail API: "7999.00")
    init(_ price: String, comparePrice: String? = nil, size: PriceSize = .normal) {
        self.integerPart = PriceFormatter.integerPart(price)
        self.fractionPart = PriceFormatter.fractionPart(price)
        self.comparePrice = comparePrice.map { PriceFormatter.withSymbol($0) }
        self.discount = comparePrice.flatMap { PriceFormatter.discountPercent(price: price, comparePrice: $0) }
        self.size = size
    }

    /// Double price (cart/order API: 7999.0)
    init(_ price: Double, comparePrice: Double? = nil, size: PriceSize = .normal) {
        self.integerPart = PriceFormatter.integerPart(price)
        self.fractionPart = PriceFormatter.fractionPart(price)
        if let cp = comparePrice {
            self.comparePrice = PriceFormatter.withSymbol(cp)
            let priceStr = String(format: "%.2f", price)
            let cpStr = String(format: "%.2f", cp)
            self.discount = PriceFormatter.discountPercent(price: priceStr, comparePrice: cpStr)
        } else {
            self.comparePrice = nil
            self.discount = nil
        }
        self.size = size
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .firstTextBaseline, spacing: 0) {
                Text("¥")
                    .font(size.symbolFont)
                    .foregroundStyle(Color.shopPrice)

                Text(integerPart)
                    .font(size.integerFont)
                    .foregroundStyle(Color.shopPrice)

                Text(fractionPart)
                    .font(size.fractionFont)
                    .foregroundStyle(Color.shopPrice)
            }

            if comparePrice != nil || discount != nil {
                HStack(spacing: 6) {
                    if let comparePrice {
                        Text(comparePrice)
                            .font(ShopFonts.caption)
                            .foregroundStyle(Color.shopTextSecondary)
                            .strikethrough()
                    }
                    if let discount {
                        Text(discount)
                            .font(ShopFonts.captionSemibold)
                            .foregroundStyle(Color.shopPrice)
                    }
                }
            }
        }
    }
}

enum PriceSize {
    case small, normal, large

    var symbolFont: Font {
        switch self {
        case .small: ShopFonts.caption
        case .normal: ShopFonts.subheadline
        case .large: ShopFonts.body
        }
    }

    var integerFont: Font {
        switch self {
        case .small: ShopFonts.priceSmall
        case .normal: ShopFonts.priceNormal
        case .large: ShopFonts.priceLarge
        }
    }

    var fractionFont: Font {
        switch self {
        case .small: ShopFonts.caption
        case .normal: ShopFonts.priceFraction
        case .large: ShopFonts.subheadline
        }
    }
}

#Preview {
    VStack(alignment: .leading, spacing: 16) {
        PriceText("7999.00", comparePrice: "9999.00", size: .large)
        PriceText("99.00", size: .normal)
        PriceText(7999.0, comparePrice: 9999.0, size: .small)
    }
    .padding()
}
