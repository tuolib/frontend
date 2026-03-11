import ComposableArchitecture
import Foundation

@Reducer
struct RegisterFeature {
    @ObservableState
    struct State: Equatable {
        var email = ""
        var password = ""
        var confirmPassword = ""
        var nickname = ""
        var isLoading = false
        var emailError: String?
        var passwordError: String?
        var confirmPasswordError: String?
        var registerSuccess = false
    }

    enum Action: BindableAction {
        case binding(BindingAction<State>)
        case registerTapped
        case registerResponse(Result<AuthResponse, Error>)
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

            case .binding(\.confirmPassword):
                state.confirmPasswordError = nil
                return .none

            case .binding:
                return .none

            case .registerTapped:
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

                if state.confirmPassword.isEmpty {
                    state.confirmPasswordError = "Please confirm your password"
                    hasError = true
                } else if state.password != state.confirmPassword {
                    state.confirmPasswordError = "Passwords do not match"
                    hasError = true
                }

                guard !hasError else { return .none }

                state.isLoading = true
                let email = state.email.trimmingCharacters(in: .whitespaces)
                let password = state.password
                let nickname = state.nickname.isEmpty ? nil : state.nickname.trimmingCharacters(in: .whitespaces)

                return .run { send in
                    let result = await Result {
                        try await authClient.register(email, password, nickname)
                    }
                    await send(.registerResponse(result))
                }

            case let .registerResponse(.success(response)):
                state.isLoading = false
                state.registerSuccess = true

                // Save tokens to Keychain
                keychainStore.save(
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    accessTokenExpiresAt: response.accessTokenExpiresAt,
                    refreshTokenExpiresAt: response.refreshTokenExpiresAt
                )

                return .run { _ in
                    await ToastManager.shared.show("Account created!", type: .success)
                }

            case let .registerResponse(.failure(error)):
                state.isLoading = false

                if let apiError = error as? APIError {
                    if apiError.is(.emailAlreadyExists) {
                        state.emailError = "Email already registered"
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
            }
        }
    }

    private func isValidEmail(_ email: String) -> Bool {
        let pattern = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: pattern, options: .regularExpression) != nil
    }
}
