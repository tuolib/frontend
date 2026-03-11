import Foundation

struct CategoryNode: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let name: String
    let slug: String
    let iconUrl: String?
    let sortOrder: Int
    let isActive: Bool
    let children: [CategoryNode]?
}
