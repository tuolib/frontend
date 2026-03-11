import Foundation

struct OrderItem: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let productId: String
    let skuId: String
    let productTitle: String
    let skuAttrs: [String: String]?
    let imageUrl: String?
    let unitPrice: String
    let quantity: Int
    let subtotal: String

    var unitPriceValue: Double {
        Double(unitPrice) ?? 0
    }

    var subtotalValue: Double {
        Double(subtotal) ?? 0
    }
}
