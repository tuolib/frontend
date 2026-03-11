import Foundation
import ComposableArchitecture

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

        var expireDate: Date? {
            guard let expiresAt = order?.expiresAt else { return nil }
            return ISO8601DateFormatter().date(from: expiresAt)
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
        case paymentCompleted(orderId: String)
    }

    @Dependency(\.orderClient) var orderClient
    @Dependency(\.paymentClient) var paymentClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.isLoading = true
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
                return .run { send in
                    let result = await Result {
                        try await paymentClient.create(orderId, method)
                    }
                    await send(.paymentCreated(result))
                }

            case .paymentCreated(.success):
                state.isPaying = false
                state.paymentSuccess = true
                return .run { [orderId = state.orderId] send in
                    await ToastManager.shared.show("Payment successful!", type: .success)
                    await send(.paymentCompleted(orderId: orderId))
                }

            case .paymentCreated(.failure):
                state.isPaying = false
                return .run { _ in
                    await ToastManager.shared.show("Payment failed", type: .error)
                }

            case .paymentCompleted:
                return .none
            }
        }
    }
}
