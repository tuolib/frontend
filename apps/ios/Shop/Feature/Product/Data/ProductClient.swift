import ComposableArchitecture

@DependencyClient
struct ProductClient: Sendable {
    var list: @Sendable (ProductAPI.ListRequest) async throws -> PaginatedResult<Product>
    var search: @Sendable (ProductAPI.SearchRequest) async throws -> PaginatedResult<Product>
}

extension ProductClient: DependencyKey {
    static let liveValue = ProductClient(
        list: { try await ProductAPI.list($0) },
        search: { try await ProductAPI.search($0) }
    )
}

extension DependencyValues {
    var productClient: ProductClient {
        get { self[ProductClient.self] }
        set { self[ProductClient.self] = newValue }
    }
}
