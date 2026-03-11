import ComposableArchitecture

@DependencyClient
struct CategoryClient: Sendable {
    var tree: @Sendable () async throws -> [CategoryNode]
    var list: @Sendable () async throws -> [CategoryNode]
}

extension CategoryClient: DependencyKey {
    static let liveValue = CategoryClient(
        tree: { try await CategoryAPI.tree() },
        list: { try await CategoryAPI.list() }
    )
}

extension DependencyValues {
    var categoryClient: CategoryClient {
        get { self[CategoryClient.self] }
        set { self[CategoryClient.self] = newValue }
    }
}
