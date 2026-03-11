import Foundation

enum CategoryAPI {
    static func tree() async throws -> [CategoryNode] {
        try await APIClient.shared.request(.categoryTree)
    }

    static func list() async throws -> [CategoryNode] {
        try await APIClient.shared.request(.categoryList)
    }
}
