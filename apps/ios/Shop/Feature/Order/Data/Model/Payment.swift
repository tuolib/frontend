import Foundation

struct Payment: Codable, Equatable, Sendable {
    let id: String
    let orderId: String
    let transactionId: String?
    let method: String
    let amount: Double
    let status: String
    let createdAt: String
}
