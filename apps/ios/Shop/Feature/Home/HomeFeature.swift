import Foundation
import ComposableArchitecture

@Reducer
struct HomeFeature {
    @ObservableState
    struct State: Equatable {
        var isLoading = false
        var isRefreshing = false
        var banners: [Banner] = []
        var categories: [CategoryNode] = []
        var deals: [Product] = []
        var newArrivals: [Product] = []
        var topRated: [Product] = []
        var categoryProducts: [String: [Product]] = [:]
        var recommended = PaginationState<Product>()
        var hasLoaded = false
    }

    enum Action {
        case onAppear
        case refresh
        case dataLoaded(Result<HomeData, Error>)
        case categoryProductsLoaded(String, Result<PaginatedResult<Product>, Error>)
        case loadMoreRecommended
        case recommendedLoaded(Result<PaginatedResult<Product>, Error>)
    }

    @Dependency(\.homeClient) var homeClient
    @Dependency(\.productClient) var productClient
    @Dependency(\.categoryClient) var categoryClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard !state.hasLoaded else { return .none }
                state.isLoading = true
                return .run { send in
                    await send(.dataLoaded(Result {
                        async let banners = homeClient.banners()
                        async let categories = categoryClient.tree()
                        async let deals = productClient.list(
                            .init(pageSize: 10, sort: "sales", order: "desc")
                        )
                        async let newArrivals = productClient.list(
                            .init(pageSize: 10, sort: "createdAt", order: "desc")
                        )
                        async let topRated = productClient.list(
                            .init(pageSize: 10, sort: "createdAt", order: "desc")
                        )
                        async let recommended = productClient.list(.init(page: 1))

                        return try await HomeData(
                            banners: banners,
                            categories: categories,
                            deals: deals.items,
                            newArrivals: newArrivals.items,
                            topRated: topRated.items,
                            recommended: recommended
                        )
                    }))
                }

            case .refresh:
                state.isRefreshing = true
                return .run { send in
                    await send(.dataLoaded(Result {
                        async let banners = homeClient.banners()
                        async let categories = categoryClient.tree()
                        async let deals = productClient.list(
                            .init(pageSize: 10, sort: "sales", order: "desc")
                        )
                        async let newArrivals = productClient.list(
                            .init(pageSize: 10, sort: "createdAt", order: "desc")
                        )
                        async let topRated = productClient.list(
                            .init(pageSize: 10, sort: "createdAt", order: "desc")
                        )
                        async let recommended = productClient.list(.init(page: 1))

                        return try await HomeData(
                            banners: banners,
                            categories: categories,
                            deals: deals.items,
                            newArrivals: newArrivals.items,
                            topRated: topRated.items,
                            recommended: recommended
                        )
                    }))
                }

            case let .dataLoaded(.success(data)):
                state.isLoading = false
                state.isRefreshing = false
                state.hasLoaded = true
                state.banners = data.banners
                state.categories = data.categories
                state.deals = data.deals
                state.newArrivals = data.newArrivals
                state.topRated = data.topRated
                state.recommended.appendPage(
                    data.recommended.items,
                    pagination: data.recommended.pagination
                )
                // Load top 4 products for each of the first 4 categories
                let topCategories = Array(data.categories.prefix(4))
                return .merge(topCategories.map { cat in
                    .run { [id = cat.id] send in
                        let result = await Result {
                            try await productClient.list(
                                .init(pageSize: 4, categoryId: id, sort: "sales", order: "desc")
                            )
                        }
                        await send(.categoryProductsLoaded(id, result))
                    }
                })

            case let .categoryProductsLoaded(categoryId, .success(result)):
                state.categoryProducts[categoryId] = result.items
                return .none

            case .categoryProductsLoaded(_, .failure):
                return .none

            case let .dataLoaded(.failure(error)):
                state.isLoading = false
                state.isRefreshing = false
                state.hasLoaded = true
                let message = error.localizedDescription
                return .run { _ in
                    await ToastManager.shared.show(message, type: .error)
                }


            case .loadMoreRecommended:
                guard state.recommended.hasMore, !state.recommended.isLoadingMore else { return .none }
                state.recommended.isLoadingMore = true
                let nextPage = state.recommended.page + 1
                return .run { send in
                    let result = await Result {
                        try await productClient.list(.init(page: nextPage))
                    }
                    await send(.recommendedLoaded(result))
                }

            case let .recommendedLoaded(.success(result)):
                state.recommended.appendPage(result.items, pagination: result.pagination)
                return .none

            case .recommendedLoaded(.failure):
                state.recommended.handleError()
                return .none
            }
        }
    }
}

struct HomeData: Equatable, Sendable {
    let banners: [Banner]
    let categories: [CategoryNode]
    let deals: [Product]
    let newArrivals: [Product]
    let topRated: [Product]
    let recommended: PaginatedResult<Product>
}

extension PaginatedResult: Equatable where T: Equatable {
    static func == (lhs: PaginatedResult<T>, rhs: PaginatedResult<T>) -> Bool {
        lhs.items == rhs.items && lhs.pagination == rhs.pagination
    }
}
