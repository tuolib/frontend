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

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        productId = try container.decode(String.self, forKey: .productId)
        skuId = try container.decode(String.self, forKey: .skuId)
        productTitle = try container.decode(String.self, forKey: .productTitle)
        // skuAttrs typed as `unknown` in backend — silently fall back to nil
        skuAttrs = try? container.decodeIfPresent([String: String].self, forKey: .skuAttrs)
        imageUrl = try container.decodeIfPresent(String.self, forKey: .imageUrl)
        // Price fields may come as String or Number from the backend
        unitPrice = try container.decodePrice(forKey: .unitPrice)
        quantity = try container.decode(Int.self, forKey: .quantity)
        subtotal = try container.decodePrice(forKey: .subtotal)
    }
}
