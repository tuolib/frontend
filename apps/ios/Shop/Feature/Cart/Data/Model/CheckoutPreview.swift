import Foundation

struct CheckoutPreview: Codable, Equatable, Sendable {
    let items: [CheckoutItem]
    let totalAmount: Double
    let totalQuantity: Int
}

struct CheckoutItem: Codable, Equatable, Sendable {
    let skuId: String
    let quantity: Int
    let productId: String
    let productTitle: String
    let skuCode: String
    let price: Double
    let attributes: [String: String]?
    let imageUrl: String?
    let subtotal: Double
}
