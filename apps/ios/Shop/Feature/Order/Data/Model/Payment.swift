import Foundation

/// Response from payment/create
struct PaymentInfo: Codable, Equatable, Sendable {
    let paymentId: String
    let method: String
    let amount: String
    let payUrl: String
}

/// Individual payment record
struct PaymentRecord: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let method: String
    let amount: String
    let status: String
    let transactionId: String?
    let createdAt: String
}

/// Response from payment/query
struct PaymentStatusResult: Codable, Equatable, Sendable {
    let orderId: String
    let orderStatus: String
    let payments: [PaymentRecord]
}
