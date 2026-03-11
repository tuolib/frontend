import ComposableArchitecture

@DependencyClient
struct CartClient: Sendable {
    var list: @Sendable () async throws -> [CartItem]
    var add: @Sendable (_ skuId: String, _ quantity: Int) async throws -> Void
    var update: @Sendable (_ skuId: String, _ quantity: Int) async throws -> Void
    var remove: @Sendable (_ skuIds: [String]) async throws -> Void
    var select: @Sendable (_ skuIds: [String], _ selected: Bool) async throws -> Void
    var checkoutPreview: @Sendable () async throws -> CheckoutPreview
}

extension CartClient: DependencyKey {
    static let liveValue = CartClient(
        list: { try await CartAPI.list() },
        add: { try await CartAPI.add(.init(skuId: $0, quantity: $1)) },
        update: { try await CartAPI.update(.init(skuId: $0, quantity: $1)) },
        remove: { try await CartAPI.remove(.init(skuIds: $0)) },
        select: { try await CartAPI.select(.init(skuIds: $0, selected: $1)) },
        checkoutPreview: { try await CartAPI.checkoutPreview() }
    )
}

extension DependencyValues {
    var cartClient: CartClient {
        get { self[CartClient.self] }
        set { self[CartClient.self] = newValue }
    }
}
