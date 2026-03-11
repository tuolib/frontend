import Foundation

struct CartItem: Codable, Equatable, Identifiable, Sendable {
    let skuId: String
    var quantity: Int
    var selected: Bool
    let productId: String
    let productTitle: String
    let skuCode: String
    let price: Double
    let comparePrice: Double?
    let stock: Int
    let attributes: [String: String]
    let imageUrl: String?
    let status: String

    var id: String { skuId }

    var subtotal: Double {
        price * Double(quantity)
    }
}
