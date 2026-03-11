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
}
