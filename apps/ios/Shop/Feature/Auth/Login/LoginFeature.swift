import ComposableArchitecture
import Foundation

@Reducer
struct LoginFeature {
    @ObservableState
    struct State: Equatable {
        var email = ""
        var password = ""
        var isLoading = false
        var emailError: String?
        var passwordError: String?
        var loginSuccess = false
    }

    enum Action: BindableAction {
        case binding(BindingAction<State>)
        case loginTapped
        case loginResponse(Result<AuthResponse, Error>)
        case navigateToRegister
    }

    @Dependency(\.authClient) var authClient
    @Dependency(\.keychainStore) var keychainStore

    var body: some ReducerOf<Self> {
        BindingReducer()

        Reduce { state, action in
            switch action {
            case .binding(\.email):
                state.emailError = nil
                return .none

            case .binding(\.password):
                state.passwordError = nil
                return .none

            case .binding:
                return .none

            case .loginTapped:
                // Validate
                var hasError = false

                if state.email.isEmpty {
                    state.emailError = "Email is required"
                    hasError = true
                } else if !isValidEmail(state.email) {
                    state.emailError = "Invalid email format"
                    hasError = true
                }

                if state.password.isEmpty {
                    state.passwordError = "Password is required"
                    hasError = true
                } else if state.password.count < 8 {
                    state.passwordError = "Password must be at least 8 characters"
                    hasError = true
                }

                guard !hasError else { return .none }

                state.isLoading = true
                let email = state.email.trimmingCharacters(in: .whitespaces)
                let password = state.password

                return .run { send in
                    let result = await Result {
                        try await authClient.login(email, password)
                    }
                    await send(.loginResponse(result))
                }

            case let .loginResponse(.success(response)):
                state.isLoading = false
                state.loginSuccess = true

                // Save tokens to Keychain
                keychainStore.save(
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    accessTokenExpiresAt: response.accessTokenExpiresAt,
                    refreshTokenExpiresAt: response.refreshTokenExpiresAt
                )

                return .run { _ in
                    await ToastManager.shared.show("Welcome back!", type: .success)
                }

            case let .loginResponse(.failure(error)):
                state.isLoading = false

                if let apiError = error as? APIError {
                    if apiError.is(.invalidCredentials) {
                        state.passwordError = "Invalid email or password"
                    } else if apiError.is(.userNotFound) {
                        state.emailError = "Account not found"
                    } else {
                        let message = apiError.message
                        return .run { _ in
                            await ToastManager.shared.show(message, type: .error)
                        }
                    }
                } else {
                    return .run { _ in
                        await ToastManager.shared.show("Network error, please try again", type: .error)
                    }
                }
                return .none

            case .navigateToRegister:
                return .none
            }
        }
    }

    private func isValidEmail(_ email: String) -> Bool {
        let pattern = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: pattern, options: .regularExpression) != nil
    }
}
