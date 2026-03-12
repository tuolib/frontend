import Foundation
import ComposableArchitecture

private let iso8601Formatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
}()

@Reducer
struct PaymentFeature {
    @ObservableState
    struct State: Equatable {
        let orderId: String
        var order: Order?
        var selectedMethod: String = "mock"
        var isLoading = false
        var isPaying = false
        var paymentSuccess = false
        var loadFailed = false

        var expireDate: Date? {
            guard let expiresAt = order?.expiresAt else { return nil }
            return iso8601Formatter.date(from: expiresAt)
        }

        var isExpired: Bool {
            guard let expireDate else { return false }
            return Date() >= expireDate
        }
    }

    enum Action {
        case onAppear
        case orderLoaded(Result<Order, Error>)
        case selectMethod(String)
        case payNow
        case paymentCreated(Result<PaymentInfo, Error>)
    }

    @Dependency(\.orderClient) var orderClient
    @Dependency(\.paymentClient) var paymentClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard state.order == nil else { return .none }
                state.isLoading = true
                state.loadFailed = false
                let orderId = state.orderId
                return .run { send in
                    let result = await Result { try await orderClient.detail(orderId) }
                    await send(.orderLoaded(result))
                }

            case let .orderLoaded(.success(order)):
                state.isLoading = false
                state.order = order
                return .none

            case .orderLoaded(.failure):
                state.isLoading = false
                state.loadFailed = true
                return .run { _ in
                    await ToastManager.shared.show("Failed to load order", type: .error)
                }

            case let .selectMethod(method):
                state.selectedMethod = method
                return .none

            case .payNow:
                guard !state.isExpired else {
                    return .run { _ in
                        await ToastManager.shared.show("Order has expired", type: .error)
                    }
                }
                state.isPaying = true
                let orderId = state.orderId
                let method = state.selectedMethod
                let payAmount = state.order?.payAmountValue ?? 0
                return .run { send in
                    let result = await Result {
                        let payInfo = try await paymentClient.create(orderId, method)
                        // For mock payment, simulate callback to complete payment
                        if method == "mock" {
                            try await paymentClient.notify(
                                orderId,
                                "tx-mock-\(payInfo.paymentId)",
                                "success",
                                payAmount,
                                "mock"
                            )
                        }
                        return payInfo
                    }
                    await send(.paymentCreated(result))
                }

            case .paymentCreated(.success):
                state.isPaying = false
                state.paymentSuccess = true
                return .run { _ in
                    await ToastManager.shared.show("Payment successful!", type: .success)
                }

            case .paymentCreated(.failure):
                state.isPaying = false
                return .run { _ in
                    await ToastManager.shared.show("Payment failed", type: .error)
                }
            }
        }
    }
}
