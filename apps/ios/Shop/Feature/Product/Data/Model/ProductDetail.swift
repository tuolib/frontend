import Foundation

struct ProductDetail: Codable, Equatable, Sendable {
    let id: String
    let title: String
    let slug: String
    let description: String?
    let brand: String?
    let status: String
    let attributes: [String: String]?
    let minPrice: String?
    let maxPrice: String?
    let totalSales: Int
    let avgRating: String
    let reviewCount: Int
    let createdAt: String
    let updatedAt: String
    let images: [ProductImage]
    let skus: [Sku]
    let categories: [ProductCategory]
}

struct ProductImage: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let url: String
    let altText: String?
    let isPrimary: Bool
    let sortOrder: Int
}

struct Sku: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let skuCode: String
    let price: String
    let comparePrice: String?
    let stock: Int
    let attributes: [String: String]
    let status: String
}

struct ProductCategory: Codable, Equatable, Sendable {
    let id: String
    let name: String
    let slug: String
}
