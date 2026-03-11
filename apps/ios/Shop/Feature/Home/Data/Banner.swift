import Foundation

struct Banner: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let title: String
    let subtitle: String?
    let imageUrl: String
    let linkType: String
    let linkValue: String?
    let sortOrder: Int
    let isActive: Bool
    let startAt: String?
    let endAt: String?
    let createdAt: String
    let updatedAt: String
}
