import Foundation

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
