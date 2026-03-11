import Foundation
import ComposableArchitecture

@Reducer
struct ProductListFeature {
    @ObservableState
    struct State: Equatable {
        var pagination = PaginationState<Product>()
        var sort: String = "createdAt"
        var order: String = "desc"
        var categoryId: String?
        var categoryName: String?
    }

    enum Action {
        case onAppear
        case refresh
        case changeSort(String, String)
        case loadNextPage
        case productsLoaded(Result<PaginatedResult<Product>, Error>)
    }

    @Dependency(\.productClient) var productClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard state.pagination.items.isEmpty else { return .none }
                state.pagination.startLoading()
                return fetchProducts(state: state, page: 1)

            case .refresh:
                state.pagination.reset()
                state.pagination.startLoading()
                return fetchProducts(state: state, page: 1)

            case let .changeSort(sort, order):
                state.sort = sort
                state.order = order
                state.pagination.reset()
                state.pagination.startLoading()
                return fetchProducts(state: state, page: 1)

            case .loadNextPage:
                guard state.pagination.hasMore, !state.pagination.isLoadingMore else { return .none }
                state.pagination.isLoadingMore = true
                return fetchProducts(state: state, page: state.pagination.page + 1)

            case let .productsLoaded(.success(result)):
                state.pagination.appendPage(result.items, pagination: result.pagination)
                return .none

            case .productsLoaded(.failure):
                state.pagination.handleError()
                return .none
            }
        }
    }

    private func fetchProducts(state: State, page: Int) -> Effect<Action> {
        .run { [sort = state.sort, order = state.order, categoryId = state.categoryId] send in
            let result = await Result {
                try await productClient.list(
                    .init(page: page, categoryId: categoryId, sort: sort, order: order)
                )
            }
            await send(.productsLoaded(result))
        }
    }
}
