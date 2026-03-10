import Foundation

struct PaginatedResult<T: Decodable & Sendable>: Decodable, Sendable {
    let items: [T]
    let pagination: Pagination
}

struct Pagination: Codable, Equatable, Sendable {
    let page: Int
    let pageSize: Int
    let total: Int
    let totalPages: Int
}
