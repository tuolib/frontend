import Foundation

enum ProductAPI {
    struct ListRequest: Encodable, Sendable {
        var page: Int = 1
        var pageSize: Int = 20
        var categoryId: String?
        var sort: String?
        var order: String?
    }

    static func list(_ request: ListRequest) async throws -> PaginatedResult<Product> {
        try await APIClient.shared.request(.productList, body: request)
    }

    static func detail(id: String) async throws -> ProductDetail {
        try await APIClient.shared.request(.productDetail, body: ["id": id])
    }

    struct SearchRequest: Encodable, Sendable {
        var keyword: String
        var page: Int = 1
        var pageSize: Int = 20
        var sort: String?
        var order: String?
    }

    static func search(_ request: SearchRequest) async throws -> PaginatedResult<Product> {
        try await APIClient.shared.request(.productSearch, body: request)
    }
}
