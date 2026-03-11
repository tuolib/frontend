import Foundation

enum AuthAPI {
    static func login(email: String, password: String) async throws -> AuthResponse {
        try await APIClient.shared.request(
            .authLogin,
            body: LoginRequest(email: email, password: password)
        )
    }

    static func register(email: String, password: String, nickname: String?) async throws -> AuthResponse {
        try await APIClient.shared.request(
            .authRegister,
            body: RegisterRequest(email: email, password: password, nickname: nickname)
        )
    }

    static func logout(refreshToken: String?) async throws {
        try await APIClient.shared.requestVoid(
            .authLogout,
            body: LogoutRequest(refreshToken: refreshToken),
            needsAuth: true
        )
    }
}
