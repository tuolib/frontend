import Foundation
import ComposableArchitecture
import IdentifiedCollections

@Reducer
struct CartFeature {
    @ObservableState
    struct State: Equatable {
        var items: IdentifiedArrayOf<CartItem> = []
        var isLoading = false
        var hasLoaded = false

        var isAllSelected: Bool {
            !items.isEmpty && items.allSatisfy(\.selected)
        }

        var selectedItems: [CartItem] {
            items.filter(\.selected)
        }

        var totalAmount: Double {
            selectedItems.reduce(0) { $0 + $1.subtotal }
        }

        var totalQuantity: Int {
            selectedItems.reduce(0) { $0 + $1.quantity }
        }
    }

    enum Action {
        case onAppear
        case refresh
        case cartLoaded(Result<[CartItem], Error>)
        case toggleSelect(String)
        case toggleSelectAll
        case updateQuantity(skuId: String, quantity: Int)
        case removeItem(String)
        case debouncedUpdate(skuId: String, quantity: Int)
        case updateResponse(Result<VoidResult, Error>)
        case removeResponse(skuId: String, Result<VoidResult, Error>)
        case selectResponse(Result<VoidResult, Error>)
        case checkout
    }

    @Dependency(\.cartClient) var cartClient
    @Dependency(\.continuousClock) var clock

    private enum CancelID: Hashable {
        case debounce(String)
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard !state.hasLoaded else { return .none }
                state.isLoading = true
                return loadCart()

            case .refresh:
                state.isLoading = true
                return loadCart()

            case let .cartLoaded(.success(items)):
                state.isLoading = false
                state.hasLoaded = true
                state.items = IdentifiedArrayOf(uniqueElements: items)
                return .none

            case .cartLoaded(.failure):
                state.isLoading = false
                state.hasLoaded = true
                return .run { _ in
                    await ToastManager.shared.show("Failed to load cart", type: .error)
                }

            case let .toggleSelect(skuId):
                guard var item = state.items[id: skuId] else { return .none }
                item.selected.toggle()
                state.items[id: skuId] = item
                return .run { [selected = item.selected] send in
                    let result = await Result {
                        try await cartClient.select([skuId], selected)
                        return VoidResult()
                    }
                    await send(.selectResponse(result))
                }

            case .toggleSelectAll:
                let newSelected = !state.isAllSelected
                for index in state.items.indices {
                    state.items[index].selected = newSelected
                }
                let skuIds = state.items.map(\.skuId)
                return .run { send in
                    let result = await Result {
                        try await cartClient.select(skuIds, newSelected)
                        return VoidResult()
                    }
                    await send(.selectResponse(result))
                }

            case let .updateQuantity(skuId, quantity):
                guard var item = state.items[id: skuId] else { return .none }
                // Optimistic update
                item.quantity = quantity
                state.items[id: skuId] = item
                // Debounce the API call
                return .run { send in
                    try await clock.sleep(for: .milliseconds(300))
                    await send(.debouncedUpdate(skuId: skuId, quantity: quantity))
                }
                .cancellable(id: CancelID.debounce(skuId), cancelInFlight: true)

            case let .debouncedUpdate(skuId, quantity):
                return .run { send in
                    let result = await Result {
                        try await cartClient.update(skuId, quantity)
                        return VoidResult()
                    }
                    await send(.updateResponse(result))
                }

            case let .removeItem(skuId):
                state.items.remove(id: skuId)
                return .run { send in
                    let result = await Result {
                        try await cartClient.remove([skuId])
                        return VoidResult()
                    }
                    await send(.removeResponse(skuId: skuId, result))
                }

            case .updateResponse(.success), .selectResponse(.success), .removeResponse(_, .success):
                return .none

            case .updateResponse(.failure):
                // Reload cart on failure to sync state
                return loadCart()

            case .selectResponse(.failure):
                return loadCart()

            case .removeResponse(_, .failure):
                return .run { _ in
                    await ToastManager.shared.show("Failed to remove item", type: .error)
                }

            case .checkout:
                // Handled by parent navigation
                return .none
            }
        }
    }

    private func loadCart() -> Effect<Action> {
        .run { send in
            let result = await Result { try await cartClient.list() }
            await send(.cartLoaded(result))
        }
    }
}
