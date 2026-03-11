import ComposableArchitecture

@DependencyClient
struct PaymentClient: Sendable {
    var create: @Sendable (_ orderId: String, _ method: String) async throws -> PaymentInfo
    var query: @Sendable (_ orderId: String) async throws -> PaymentStatusResult
    var notify: @Sendable (_ orderId: String, _ transactionId: String, _ status: String, _ amount: Double, _ method: String) async throws -> Void
}

extension PaymentClient: DependencyKey {
    static let liveValue = PaymentClient(
        create: { orderId, method in
            try await PaymentAPI.create(.init(orderId: orderId, method: method))
        },
        query: { orderId in
            try await PaymentAPI.query(.init(orderId: orderId))
        },
        notify: { orderId, transactionId, status, amount, method in
            try await PaymentAPI.notify(.init(
                orderId: orderId,
                transactionId: transactionId,
                status: status,
                amount: amount,
                method: method
            ))
        }
    )
}

extension DependencyValues {
    var paymentClient: PaymentClient {
        get { self[PaymentClient.self] }
        set { self[PaymentClient.self] = newValue }
    }
}
