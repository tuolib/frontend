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

    // Custom decoder: skuAttrs typed as `unknown` in backend,
    // silently fall back to nil if it's not a [String: String]
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        productId = try container.decode(String.self, forKey: .productId)
        skuId = try container.decode(String.self, forKey: .skuId)
        productTitle = try container.decode(String.self, forKey: .productTitle)
        skuAttrs = try? container.decodeIfPresent([String: String].self, forKey: .skuAttrs)
        imageUrl = try container.decodeIfPresent(String.self, forKey: .imageUrl)
        unitPrice = try container.decode(String.self, forKey: .unitPrice)
        quantity = try container.decode(Int.self, forKey: .quantity)
        subtotal = try container.decode(String.self, forKey: .subtotal)
    }
}
