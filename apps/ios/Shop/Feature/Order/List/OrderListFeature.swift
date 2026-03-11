import Foundation
import ComposableArchitecture

@Reducer
struct OrderListFeature {
    @ObservableState
    struct State: Equatable {
        var selectedTab: OrderStatus = .all
        var pagination = PaginationState<Order>()
        var hasLoaded = false
    }

    enum Action {
        case onAppear
        case refresh
        case selectTab(OrderStatus)
        case loadPage(Int)
        case ordersLoaded(Result<PaginatedResult<Order>, Error>)
        case loadMore
        case cancelOrder(String)
        case orderCancelled(String, Result<VoidResult, Error>)
    }

    @Dependency(\.orderClient) var orderClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard !state.hasLoaded else { return .none }
                state.hasLoaded = true
                return loadOrders(state: &state, page: 1)

            case .refresh:
                return loadOrders(state: &state, page: 1)

            case let .selectTab(tab):
                state.selectedTab = tab
                state.pagination.reset()
                return loadOrders(state: &state, page: 1)

            case let .loadPage(page):
                return loadOrders(state: &state, page: page)

            case let .ordersLoaded(.success(result)):
                state.pagination.appendPage(result.items, pagination: result.pagination)
                return .none

            case .ordersLoaded(.failure):
                state.pagination.handleError()
                return .run { _ in
                    await ToastManager.shared.show("Failed to load orders", type: .error)
                }

            case .loadMore:
                guard state.pagination.hasMore, !state.pagination.isLoadingMore else { return .none }
                return loadOrders(state: &state, page: state.pagination.page + 1)

            case let .cancelOrder(orderId):
                return .run { send in
                    let result = await Result {
                        try await orderClient.cancel(orderId, nil)
                        return VoidResult()
                    }
                    await send(.orderCancelled(orderId, result))
                }

            case let .orderCancelled(orderId, .success):
                if var order = state.pagination.items[id: orderId] {
                    // Update status locally — the real model is let, so reload
                    return .run { send in
                        await ToastManager.shared.show("Order cancelled", type: .success)
                        await send(.refresh)
                    }
                }
                return .none

            case .orderCancelled(_, .failure):
                return .run { _ in
                    await ToastManager.shared.show("Failed to cancel order", type: .error)
                }
            }
        }
    }

    private func loadOrders(state: inout State, page: Int) -> Effect<Action> {
        state.pagination.startLoading()
        let status = state.selectedTab == .all ? nil : state.selectedTab.rawValue
        return .run { send in
            let result = await Result {
                try await orderClient.list(page, 10, status)
            }
            await send(.ordersLoaded(result))
        }
    }
}
