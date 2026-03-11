import Foundation

/// Response from payment/create
struct PaymentInfo: Codable, Equatable, Sendable {
    let paymentId: String
    let method: String
    let amount: String
    let payUrl: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        paymentId = try container.decode(String.self, forKey: .paymentId)
        method = try container.decode(String.self, forKey: .method)
        amount = try container.decodePrice(forKey: .amount)
        payUrl = try container.decode(String.self, forKey: .payUrl)
    }
}

/// Individual payment record
struct PaymentRecord: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let method: String
    let amount: String
    let status: String
    let transactionId: String?
    let createdAt: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        method = try container.decode(String.self, forKey: .method)
        amount = try container.decodePrice(forKey: .amount)
        status = try container.decode(String.self, forKey: .status)
        transactionId = try container.decodeIfPresent(String.self, forKey: .transactionId)
        createdAt = try container.decode(String.self, forKey: .createdAt)
    }
}

/// Response from payment/query
struct PaymentStatusResult: Codable, Equatable, Sendable {
    let orderId: String
    let orderStatus: String
    let payments: [PaymentRecord]
}
