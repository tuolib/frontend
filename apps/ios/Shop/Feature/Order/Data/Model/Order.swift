import Foundation

/// Full order — returned by order/create and order/detail
struct Order: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let orderNo: String
    let userId: String
    let status: String
    let totalAmount: Double
    let payAmount: Double
    let remark: String?
    let expiredAt: String?
    let createdAt: String
    let updatedAt: String
    let items: [OrderItem]
    let address: OrderAddress?

    var orderStatus: OrderStatus {
        OrderStatus(rawValue: status) ?? .pending
    }
}

/// Simplified order — returned by order/list
struct OrderSummary: Codable, Equatable, Identifiable, Sendable {
    let orderId: String
    let orderNo: String
    let status: String
    let payAmount: String
    let itemCount: Int
    let firstItem: OrderFirstItem?
    let createdAt: String

    var id: String { orderId }

    var orderStatus: OrderStatus {
        OrderStatus(rawValue: status) ?? .pending
    }

    var payAmountValue: Double {
        Double(payAmount) ?? 0
    }
}

struct OrderFirstItem: Codable, Equatable, Sendable {
    let productTitle: String
    let imageUrl: String?
    let skuAttrs: [String: String]?
}
