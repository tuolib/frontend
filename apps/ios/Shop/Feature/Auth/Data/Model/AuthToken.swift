import Foundation

struct AuthToken: Codable, Equatable, Sendable {
    let accessToken: String
    let refreshToken: String
    let accessTokenExpiresAt: String
    let refreshTokenExpiresAt: String
}

struct AuthUser: Codable, Equatable, Sendable {
    let id: String
    let email: String
    let nickname: String?
    let avatarUrl: String?
    let phone: String?
    let status: String
    let lastLogin: String?
    let createdAt: String
    let updatedAt: String
}

struct AuthResponse: Codable, Equatable, Sendable {
    let user: AuthUser
    let accessToken: String
    let refreshToken: String
    let accessTokenExpiresAt: String
    let refreshTokenExpiresAt: String
}

struct LoginRequest: Encodable, Sendable {
    let email: String
    let password: String
}

struct RegisterRequest: Encodable, Sendable {
    let email: String
    let password: String
    let nickname: String?
}

struct LogoutRequest: Encodable, Sendable {
    let refreshToken: String?
}
