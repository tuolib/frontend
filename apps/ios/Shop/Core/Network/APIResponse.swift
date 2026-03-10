import Foundation

struct APIResponse<T: Decodable>: Decodable {
    let code: Int
    let success: Bool
    let data: T?
    let message: String
    let meta: APIMeta?
    let traceId: String?
}

struct APIMeta: Decodable {
    let code: String?
    let message: String?
    let details: AnyCodable?
}

/// Type-erased Codable wrapper for unknown JSON structures
struct AnyCodable: Decodable {
    let value: Any

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map(\.value)
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues(\.value)
        } else {
            value = NSNull()
        }
    }
}

// MARK: - JSONDecoder Extension

extension JSONDecoder {
    /// Shop decoder — API returns camelCase JSON, no key conversion needed
    static let shop: JSONDecoder = {
        let decoder = JSONDecoder()
        return decoder
    }()
}
