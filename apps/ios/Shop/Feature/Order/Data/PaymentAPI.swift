import Foundation

enum PaymentAPI {
    struct CreateRequest: Encodable, Sendable {
        let orderId: String
        let method: String
    }

    static func create(_ request: CreateRequest) async throws -> PaymentInfo {
        try await APIClient.shared.request(.paymentCreate, body: request, needsAuth: true)
    }

    struct QueryRequest: Encodable, Sendable {
        let orderId: String
    }

    static func query(_ request: QueryRequest) async throws -> PaymentStatusResult {
        try await APIClient.shared.request(.paymentQuery, body: request, needsAuth: true)
    }

    struct NotifyRequest: Encodable, Sendable {
        let orderId: String
        let transactionId: String
        let status: String
        let amount: Double
        let method: String
    }

    /// Mock payment callback — simulates third-party gateway notification
    static func notify(_ request: NotifyRequest) async throws {
        try await APIClient.shared.requestVoid(.paymentNotify, body: request)
    }
}
