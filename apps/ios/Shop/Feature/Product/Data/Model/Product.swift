import Foundation
import ComposableArchitecture

struct Product: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let title: String
    let slug: String
    let brand: String?
    let status: String
    let minPrice: String?
    let maxPrice: String?
    let totalSales: Int
    let avgRating: String
    let reviewCount: Int
    let primaryImage: String?
    let createdAt: String
}
