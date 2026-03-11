import Foundation

/// Helpers for decoding price fields that may come as String or Number from the backend.
/// The H5 frontend uses `formatPrice(price: string | number)` to handle both.
extension KeyedDecodingContainer {
    /// Decode a price field that could be JSON string ("1199.00") or number (1199.00)
    func decodePrice(forKey key: Key) throws -> String {
        if let str = try? decode(String.self, forKey: key) {
            return str
        }
        if let num = try? decode(Double.self, forKey: key) {
            return String(format: "%.2f", num)
        }
        if let num = try? decode(Int.self, forKey: key) {
            return String(format: "%.2f", Double(num))
        }
        throw DecodingError.typeMismatch(
            String.self,
            .init(codingPath: codingPath + [key], debugDescription: "Expected String or Number for price")
        )
    }

    /// Decode an optional price field
    func decodePriceIfPresent(forKey key: Key) throws -> String? {
        guard contains(key) else { return nil }
        if try decodeNil(forKey: key) { return nil }
        return try decodePrice(forKey: key)
    }
}
