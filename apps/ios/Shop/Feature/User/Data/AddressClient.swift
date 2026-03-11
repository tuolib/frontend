import ComposableArchitecture

@DependencyClient
struct AddressClient: Sendable {
    var list: @Sendable () async throws -> [Address]
    var create: @Sendable (_ request: AddressAPI.CreateRequest) async throws -> Address
    var update: @Sendable (_ request: AddressAPI.UpdateRequest) async throws -> Address
    var delete: @Sendable (_ id: String) async throws -> Void
}

extension AddressClient: DependencyKey {
    static let liveValue = AddressClient(
        list: { try await AddressAPI.list() },
        create: { try await AddressAPI.create($0) },
        update: { try await AddressAPI.update($0) },
        delete: { try await AddressAPI.delete(.init(id: $0)) }
    )
}

extension DependencyValues {
    var addressClient: AddressClient {
        get { self[AddressClient.self] }
        set { self[AddressClient.self] = newValue }
    }
}
