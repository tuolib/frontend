import Foundation

/// Minimal result from order/create
struct CreateOrderResult: Codable, Equatable, Sendable {
    let orderId: String
    let orderNo: String
    let payAmount: String
    let expiresAt: String

    var payAmountValue: Double {
        Double(payAmount) ?? 0
    }
}

/// Full order — returned by order/detail
struct Order: Codable, Equatable, Identifiable, Sendable {
    let orderId: String
    let orderNo: String
    let status: String
    let totalAmount: String
    let discountAmount: String
    let payAmount: String
    let remark: String?
    let expiresAt: String
    let paidAt: String?
    let shippedAt: String?
    let deliveredAt: String?
    let completedAt: String?
    let cancelledAt: String?
    let cancelReason: String?
    let createdAt: String
    let items: [OrderItem]
    let address: OrderAddress?

    var id: String { orderId }

    var orderStatus: OrderStatus {
        OrderStatus(rawValue: status) ?? .pending
    }

    var totalAmountValue: Double {
        Double(totalAmount) ?? 0
    }

    var payAmountValue: Double {
        Double(payAmount) ?? 0
    }

    var discountAmountValue: Double {
        Double(discountAmount) ?? 0
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
