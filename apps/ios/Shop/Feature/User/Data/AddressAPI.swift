import Foundation

enum AddressAPI {
    static func list() async throws -> [Address] {
        try await APIClient.shared.request(.addressList, needsAuth: true)
    }

    struct CreateRequest: Encodable, Sendable {
        let label: String?
        let recipient: String
        let phone: String
        let province: String
        let city: String
        let district: String
        let address: String
        let postalCode: String?
        let isDefault: Bool
    }

    static func create(_ request: CreateRequest) async throws -> Address {
        try await APIClient.shared.request(.addressCreate, body: request, needsAuth: true)
    }

    struct UpdateRequest: Encodable, Sendable {
        let id: String
        let label: String?
        let recipient: String
        let phone: String
        let province: String
        let city: String
        let district: String
        let address: String
        let postalCode: String?
        let isDefault: Bool
    }

    static func update(_ request: UpdateRequest) async throws -> Address {
        try await APIClient.shared.request(.addressUpdate, body: request, needsAuth: true)
    }

    struct DeleteRequest: Encodable, Sendable {
        let id: String
    }

    static func delete(_ request: DeleteRequest) async throws {
        try await APIClient.shared.requestVoid(.addressDelete, body: request, needsAuth: true)
    }
}
