import ComposableArchitecture

@DependencyClient
struct HomeClient: Sendable {
    var banners: @Sendable () async throws -> [Banner]
}

extension HomeClient: DependencyKey {
    static let liveValue = HomeClient(
        banners: { try await HomeAPI.banners() }
    )
}

extension DependencyValues {
    var homeClient: HomeClient {
        get { self[HomeClient.self] }
        set { self[HomeClient.self] = newValue }
    }
}
