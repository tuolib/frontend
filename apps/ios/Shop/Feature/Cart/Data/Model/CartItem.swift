import Foundation

struct CartItem: Codable, Equatable, Identifiable, Sendable {
    let skuId: String
    var quantity: Int
    var selected: Bool
    let addedAt: String?
    let snapshot: CartSnapshot
    let currentPrice: String
    let currentStock: Int
    let priceChanged: Bool
    let unavailable: Bool
    let stockInsufficient: Bool

    var id: String { skuId }

    var price: Double {
        Double(currentPrice) ?? 0
    }

    var subtotal: Double {
        price * Double(quantity)
    }
}

struct CartSnapshot: Codable, Equatable, Sendable {
    let productId: String
    let productTitle: String
    let skuAttrs: [String: String]?
    let price: String
    let imageUrl: String?
}
