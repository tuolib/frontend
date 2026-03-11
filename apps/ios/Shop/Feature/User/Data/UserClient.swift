import ComposableArchitecture

@DependencyClient
struct UserClient: Sendable {
    var profile: @Sendable () async throws -> User
    var update: @Sendable (_ nickname: String?, _ avatarUrl: String?, _ phone: String?) async throws -> User
}

extension UserClient: DependencyKey {
    static let liveValue = UserClient(
        profile: { try await UserAPI.profile() },
        update: { nickname, avatarUrl, phone in
            try await UserAPI.update(.init(nickname: nickname, avatarUrl: avatarUrl, phone: phone))
        }
    )
}

extension DependencyValues {
    var userClient: UserClient {
        get { self[UserClient.self] }
        set { self[UserClient.self] = newValue }
    }
}
