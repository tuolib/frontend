import Foundation
import ComposableArchitecture

@Reducer
struct OrderDetailFeature {
    @ObservableState
    struct State: Equatable {
        let orderId: String
        var order: Order?
        var isLoading = false
        var showCancelDialog = false
    }

    enum Action {
        case onAppear
        case refresh
        case orderLoaded(Result<Order, Error>)
        case showCancelConfirmation
        case dismissCancelConfirmation
        case confirmCancel
        case orderCancelled(Result<VoidResult, Error>)
        case goToPayment(String)
    }

    @Dependency(\.orderClient) var orderClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.isLoading = true
                return loadOrder(orderId: state.orderId)

            case .refresh:
                return loadOrder(orderId: state.orderId)

            case let .orderLoaded(.success(order)):
                state.isLoading = false
                state.order = order
                return .none

            case .orderLoaded(.failure):
                state.isLoading = false
                return .run { _ in
                    await ToastManager.shared.show("Failed to load order", type: .error)
                }

            case .showCancelConfirmation:
                state.showCancelDialog = true
                return .none

            case .dismissCancelConfirmation:
                state.showCancelDialog = false
                return .none

            case .confirmCancel:
                state.showCancelDialog = false
                let orderId = state.orderId
                return .run { send in
                    let result = await Result {
                        try await orderClient.cancel(orderId, nil)
                        return VoidResult()
                    }
                    await send(.orderCancelled(result))
                }

            case .orderCancelled(.success):
                return .run { [orderId = state.orderId] send in
                    await ToastManager.shared.show("Order cancelled", type: .success)
                    await send(.refresh)
                }

            case .orderCancelled(.failure):
                return .run { _ in
                    await ToastManager.shared.show("Failed to cancel order", type: .error)
                }

            case .goToPayment:
                return .none
            }
        }
    }

    private func loadOrder(orderId: String) -> Effect<Action> {
        .run { send in
            let result = await Result { try await orderClient.detail(orderId) }
            await send(.orderLoaded(result))
        }
    }
}
