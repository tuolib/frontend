import Foundation

actor AuthManager {
    static let shared = AuthManager()

    private let keychain: KeychainStore
    private var refreshTask: Task<String, Error>?

    init(keychain: KeychainStore = .shared) {
        self.keychain = keychain
    }

    /// Get a valid access token; proactively refresh if expiring within 60s
    func validAccessToken() async throws -> String {
        if let expiresAt = keychain.getAccessTokenExpiresAt(),
           Date.now.addingTimeInterval(60) > expiresAt {
            return try await refreshAccessToken()
        }

        guard let token = keychain.getAccessToken() else {
            throw APIError.unauthorized
        }
        return token
    }

    /// Coalesced refresh — concurrent callers share the same Task
    @discardableResult
    func refreshAccessToken() async throws -> String {
        if let existing = refreshTask {
            return try await existing.value
        }

        let task = Task<String, Error> {
            defer { refreshTask = nil }

            guard let refreshToken = keychain.getRefreshToken() else {
                keychain.clear()
                throw APIError.unauthorized
            }

            struct RefreshBody: Encodable, Sendable {
                let refreshToken: String
            }

            struct RefreshResponse: Decodable, Sendable {
                let accessToken: String
                let refreshToken: String
                let accessTokenExpiresAt: String
                let refreshTokenExpiresAt: String
            }

            let result: RefreshResponse = try await APIClient.shared.rawRequest(
                .authRefresh,
                body: RefreshBody(refreshToken: refreshToken)
            )

            keychain.save(
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                accessTokenExpiresAt: result.accessTokenExpiresAt,
                refreshTokenExpiresAt: result.refreshTokenExpiresAt
            )

            return result.accessToken
        }

        refreshTask = task
        return try await task.value
    }

    func logout() {
        refreshTask?.cancel()
        refreshTask = nil
        keychain.clear()
    }

    var isLoggedIn: Bool {
        keychain.getAccessToken() != nil
    }

    /// Synchronous check — safe to call from non-async context since KeychainStore is Sendable
    nonisolated var isLoggedInSync: Bool {
        keychain.getAccessToken() != nil
    }
}
