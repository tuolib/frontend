import ComposableArchitecture

@DependencyClient
struct PaymentClient: Sendable {
    var create: @Sendable (_ orderId: String, _ method: String) async throws -> Payment
    var query: @Sendable (_ orderId: String) async throws -> Payment
}

extension PaymentClient: DependencyKey {
    static let liveValue = PaymentClient(
        create: { orderId, method in
            try await PaymentAPI.create(.init(orderId: orderId, method: method))
        },
        query: { orderId in
            try await PaymentAPI.query(.init(orderId: orderId))
        }
    )
}

extension DependencyValues {
    var paymentClient: PaymentClient {
        get { self[PaymentClient.self] }
        set { self[PaymentClient.self] = newValue }
    }
}
