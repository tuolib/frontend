import Foundation
import ComposableArchitecture

@Reducer
struct SearchFeature {
    @ObservableState
    struct State: Equatable {
        var keyword = ""
        var phase: Phase = .idle
        var history: [String] = []
        var pagination = PaginationState<Product>()
        var sort: String? = nil
        var order: String? = nil

        enum Phase: Equatable {
            case idle
            case searching
            case results
            case empty
        }
    }

    enum Action: BindableAction {
        case binding(BindingAction<State>)
        case onAppear
        case submitSearch
        case selectKeyword(String)
        case clearHistory
        case changeSort(String?, String?)
        case loadNextPage
        case searchResponse(Result<PaginatedResult<Product>, Error>)
    }

    @Dependency(\.productClient) var productClient
    @Dependency(\.searchHistoryStore) var searchHistoryStore

    var body: some ReducerOf<Self> {
        BindingReducer()
        Reduce { state, action in
            switch action {
            case .binding:
                return .none

            case .onAppear:
                state.history = searchHistoryStore.getHistory()
                return .none

            case .submitSearch:
                let keyword = state.keyword.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !keyword.isEmpty else { return .none }
                state.keyword = keyword
                searchHistoryStore.addKeyword(keyword)
                state.history = searchHistoryStore.getHistory()
                state.pagination.reset()
                state.phase = .searching
                return search(keyword: keyword, page: 1, sort: state.sort, order: state.order)

            case let .selectKeyword(keyword):
                state.keyword = keyword
                return .send(.submitSearch)

            case .clearHistory:
                searchHistoryStore.clear()
                state.history = []
                return .none

            case let .changeSort(sort, order):
                state.sort = sort
                state.order = order
                state.pagination.reset()
                state.phase = .searching
                return search(keyword: state.keyword, page: 1, sort: sort, order: order)

            case .loadNextPage:
                guard state.pagination.hasMore, !state.pagination.isLoadingMore else { return .none }
                state.pagination.isLoadingMore = true
                let nextPage = state.pagination.page + 1
                return search(keyword: state.keyword, page: nextPage, sort: state.sort, order: state.order)

            case let .searchResponse(.success(result)):
                state.pagination.appendPage(result.items, pagination: result.pagination)
                state.phase = state.pagination.items.isEmpty ? .empty : .results
                return .none

            case .searchResponse(.failure):
                state.pagination.handleError()
                state.phase = state.pagination.items.isEmpty ? .empty : .results
                return .none
            }
        }
    }

    private func search(keyword: String, page: Int, sort: String?, order: String?) -> Effect<Action> {
        .run { send in
            let result = await Result {
                try await productClient.search(
                    .init(keyword: keyword, page: page, sort: sort, order: order)
                )
            }
            await send(.searchResponse(result))
        }
    }
}
