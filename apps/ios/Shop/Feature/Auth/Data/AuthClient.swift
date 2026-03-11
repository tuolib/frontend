import ComposableArchitecture

@DependencyClient
struct AuthClient: Sendable {
    var login: @Sendable (_ email: String, _ password: String) async throws -> AuthResponse
    var register: @Sendable (_ email: String, _ password: String, _ nickname: String?) async throws -> AuthResponse
    var logout: @Sendable (_ refreshToken: String?) async throws -> Void
}

extension AuthClient: DependencyKey {
    static let liveValue = AuthClient(
        login: { email, password in
            try await AuthAPI.login(email: email, password: password)
        },
        register: { email, password, nickname in
            try await AuthAPI.register(email: email, password: password, nickname: nickname)
        },
        logout: { refreshToken in
            try await AuthAPI.logout(refreshToken: refreshToken)
        }
    )
}

extension DependencyValues {
    var authClient: AuthClient {
        get { self[AuthClient.self] }
        set { self[AuthClient.self] = newValue }
    }
}
