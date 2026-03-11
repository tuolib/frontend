import Foundation

enum UserAPI {
    static func profile() async throws -> User {
        try await APIClient.shared.request(.userProfile, needsAuth: true)
    }

    struct UpdateRequest: Encodable, Sendable {
        let nickname: String?
        let avatarUrl: String?
        let phone: String?
    }

    static func update(_ request: UpdateRequest) async throws -> User {
        try await APIClient.shared.request(.userUpdate, body: request, needsAuth: true)
    }
}
