import Foundation
import ComposableArchitecture

@Reducer
struct ProfileFeature {
    @ObservableState
    struct State: Equatable {
        var user: User?
        var recentOrders: [OrderSummary] = []
        var isLoading = false
        var hasLoaded = false
        var isLoggingOut = false
        var showLogoutConfirm = false
    }

    enum Action {
        case onAppear
        case refresh
        case profileLoaded(Result<User, Error>)
        case recentOrdersLoaded(Result<PaginatedResult<OrderSummary>, Error>)
        case showLogoutConfirmation
        case dismissLogoutConfirmation
        case confirmLogout
        case logoutCompleted
    }

    @Dependency(\.userClient) var userClient
    @Dependency(\.orderClient) var orderClient
    @Dependency(\.authClient) var authClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard !state.hasLoaded else { return .none }
                state.isLoading = true
                return .merge(
                    .run { send in
                        let result = await Result { try await userClient.profile() }
                        await send(.profileLoaded(result))
                    },
                    .run { send in
                        let result = await Result { try await orderClient.list(1, 3, nil) }
                        await send(.recentOrdersLoaded(result))
                    }
                )

            case .refresh:
                return .merge(
                    .run { send in
                        let result = await Result { try await userClient.profile() }
                        await send(.profileLoaded(result))
                    },
                    .run { send in
                        let result = await Result { try await orderClient.list(1, 3, nil) }
                        await send(.recentOrdersLoaded(result))
                    }
                )

            case let .profileLoaded(.success(user)):
                state.isLoading = false
                state.hasLoaded = true
                state.user = user
                return .none

            case .profileLoaded(.failure):
                state.isLoading = false
                state.hasLoaded = true
                return .none

            case let .recentOrdersLoaded(.success(result)):
                state.recentOrders = result.items
                return .none

            case .recentOrdersLoaded(.failure):
                return .none

            case .showLogoutConfirmation:
                state.showLogoutConfirm = true
                return .none

            case .dismissLogoutConfirmation:
                state.showLogoutConfirm = false
                return .none

            case .confirmLogout:
                state.showLogoutConfirm = false
                state.isLoggingOut = true
                return .run { send in
                    let refreshToken = KeychainStore.shared.getRefreshToken()
                    try? await authClient.logout(refreshToken)
                    await AuthManager.shared.logout()
                    await send(.logoutCompleted)
                }

            case .logoutCompleted:
                state.isLoggingOut = false
                state.user = nil
                state.recentOrders = []
                state.hasLoaded = false
                return .none
            }
        }
    }
}
