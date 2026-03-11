import Foundation
import ComposableArchitecture

@Reducer
struct MenuFeature {
    @ObservableState
    struct State: Equatable {
        var categories: [CategoryNode] = []
        var selectedId: String? = nil
        var isLoading = false
        var hasLoaded = false
        var popularProducts: [Product] = []
        var isLoadingPopular = false

        var subcategories: [CategoryNode] {
            guard let selectedId else { return [] }
            return categories.first { $0.id == selectedId }?.children ?? []
        }

        var selectedCategory: CategoryNode? {
            guard let selectedId else { return nil }
            return categories.first { $0.id == selectedId }
        }
    }

    enum Action {
        case onAppear
        case categoriesLoaded(Result<[CategoryNode], Error>)
        case selectCategory(String)
        case popularLoaded(Result<PaginatedResult<Product>, Error>)
    }

    @Dependency(\.categoryClient) var categoryClient
    @Dependency(\.productClient) var productClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard !state.hasLoaded else { return .none }
                state.isLoading = true
                return .run { send in
                    let result = await Result { try await categoryClient.tree() }
                    await send(.categoriesLoaded(result))
                }

            case let .categoriesLoaded(.success(categories)):
                state.isLoading = false
                state.hasLoaded = true
                state.categories = categories
                state.selectedId = categories.first?.id
                if let firstId = categories.first?.id {
                    return loadPopular(categoryId: firstId)
                }
                return .none

            case .categoriesLoaded(.failure):
                state.isLoading = false
                state.hasLoaded = true
                return .none

            case let .selectCategory(id):
                state.selectedId = id
                state.popularProducts = []
                return loadPopular(categoryId: id)

            case let .popularLoaded(.success(result)):
                state.isLoadingPopular = false
                state.popularProducts = result.items
                return .none

            case .popularLoaded(.failure):
                state.isLoadingPopular = false
                return .none
            }
        }
    }

    private func loadPopular(categoryId: String) -> Effect<Action> {
        .run { send in
            let result = await Result {
                try await productClient.list(
                    .init(pageSize: 6, categoryId: categoryId, sort: "sales", order: "desc")
                )
            }
            await send(.popularLoaded(result))
        }
    }
}
