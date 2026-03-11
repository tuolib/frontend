import Foundation

struct User: Codable, Equatable, Sendable {
    let id: String
    let email: String
    let nickname: String?
    let avatarUrl: String?
    let phone: String?
    let status: String
    let lastLogin: String?
    let createdAt: String
    let updatedAt: String

    var displayName: String {
        nickname ?? email.components(separatedBy: "@").first ?? "User"
    }
}
