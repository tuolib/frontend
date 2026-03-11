import Foundation

enum OrderAPI {
    struct CreateRequest: Encodable, Sendable {
        let items: [CreateItem]
        let addressId: String
        let remark: String?

        struct CreateItem: Encodable, Sendable {
            let skuId: String
            let quantity: Int
        }
    }

    static func create(_ request: CreateRequest) async throws -> Order {
        try await APIClient.shared.request(.orderCreate, body: request, needsAuth: true)
    }

    struct ListRequest: Encodable, Sendable {
        let page: Int
        let pageSize: Int
        let status: String?
    }

    static func list(_ request: ListRequest) async throws -> PaginatedResult<Order> {
        try await APIClient.shared.request(.orderList, body: request, needsAuth: true)
    }

    struct DetailRequest: Encodable, Sendable {
        let orderId: String
    }

    static func detail(_ request: DetailRequest) async throws -> Order {
        try await APIClient.shared.request(.orderDetail, body: request, needsAuth: true)
    }

    struct CancelRequest: Encodable, Sendable {
        let orderId: String
        let reason: String?
    }

    static func cancel(_ request: CancelRequest) async throws {
        try await APIClient.shared.requestVoid(.orderCancel, body: request, needsAuth: true)
    }
}
