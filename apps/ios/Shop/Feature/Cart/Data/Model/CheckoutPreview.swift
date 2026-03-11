import Foundation

struct CheckoutPreview: Codable, Equatable, Sendable {
    let items: [CheckoutItem]
    let summary: CheckoutSummary
    let warnings: CheckoutWarnings
    let canCheckout: Bool

    var totalQuantity: Int {
        items.reduce(0) { $0 + $1.quantity }
    }
}

struct CheckoutItem: Codable, Equatable, Sendable {
    let skuId: String
    let quantity: Int
    let currentPrice: String
    let currentStock: Int
    let productId: String
    let productTitle: String
    let skuAttrs: [String: String]?
    let imageUrl: String?

    var priceValue: Double {
        Double(currentPrice) ?? 0
    }

    var subtotalValue: Double {
        priceValue * Double(quantity)
    }
}

struct CheckoutSummary: Codable, Equatable, Sendable {
    let itemsTotal: String
    let shippingFee: String
    let discountAmount: String
    let payAmount: String

    var payAmountValue: Double {
        Double(payAmount) ?? 0
    }

    var itemsTotalValue: Double {
        Double(itemsTotal) ?? 0
    }

    var shippingFeeValue: Double {
        Double(shippingFee) ?? 0
    }

    var discountAmountValue: Double {
        Double(discountAmount) ?? 0
    }
}

struct CheckoutWarnings: Codable, Equatable, Sendable {
    let unavailableItems: [UnavailableItem]
    let priceChangedItems: [PriceChangedItem]
    let insufficientItems: [InsufficientItem]

    var hasWarnings: Bool {
        !unavailableItems.isEmpty || !priceChangedItems.isEmpty || !insufficientItems.isEmpty
    }

    struct UnavailableItem: Codable, Equatable, Sendable {
        let skuId: String
        let productTitle: String
    }

    struct PriceChangedItem: Codable, Equatable, Sendable {
        let skuId: String
        let productTitle: String
        let oldPrice: String
        let newPrice: String
    }

    struct InsufficientItem: Codable, Equatable, Sendable {
        let skuId: String
        let productTitle: String
        let requested: Int
        let available: Int
    }
}
