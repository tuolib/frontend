import Foundation

struct Address: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let userId: String
    let label: String?
    let recipient: String
    let phone: String
    let province: String
    let city: String
    let district: String
    let address: String
    let postalCode: String?
    let isDefault: Bool
    let createdAt: String
    let updatedAt: String

    var fullAddress: String {
        "\(province) \(city) \(district) \(address)"
    }
}

struct OrderAddress: Codable, Equatable, Sendable {
    let recipient: String
    let phone: String
    let province: String
    let city: String
    let district: String
    let address: String
    let postalCode: String?

    var fullAddress: String {
        "\(province) \(city) \(district) \(address)"
    }
}
