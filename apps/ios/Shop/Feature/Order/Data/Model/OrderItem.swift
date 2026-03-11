import Foundation

struct OrderItem: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let skuId: String
    let productId: String
    let productTitle: String
    let skuCode: String
    let skuAttributes: [String: String]
    let imageUrl: String?
    let price: Double
    let quantity: Int
    let subtotal: Double
}
