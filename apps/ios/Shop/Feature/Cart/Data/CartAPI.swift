import Foundation

enum CartAPI {
    static func list() async throws -> [CartItem] {
        try await APIClient.shared.request(.cartList, needsAuth: true)
    }

    struct AddRequest: Encodable, Sendable {
        let skuId: String
        let quantity: Int
    }

    static func add(_ request: AddRequest) async throws {
        try await APIClient.shared.requestVoid(.cartAdd, body: request, needsAuth: true)
    }

    struct UpdateRequest: Encodable, Sendable {
        let skuId: String
        let quantity: Int
    }

    static func update(_ request: UpdateRequest) async throws {
        try await APIClient.shared.requestVoid(.cartUpdate, body: request, needsAuth: true)
    }

    struct RemoveRequest: Encodable, Sendable {
        let skuIds: [String]
    }

    static func remove(_ request: RemoveRequest) async throws {
        try await APIClient.shared.requestVoid(.cartRemove, body: request, needsAuth: true)
    }

    struct SelectRequest: Encodable, Sendable {
        let skuIds: [String]
        let selected: Bool
    }

    static func select(_ request: SelectRequest) async throws {
        try await APIClient.shared.requestVoid(.cartSelect, body: request, needsAuth: true)
    }

    static func checkoutPreview() async throws -> CheckoutPreview {
        try await APIClient.shared.request(.cartCheckoutPreview, needsAuth: true)
    }
}
