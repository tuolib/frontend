import Foundation
import Security

final class KeychainStore: Sendable {
    static let shared = KeychainStore()

    private let service = "com.example.shop"

    // MARK: - Token Operations

    func save(
        accessToken: String,
        refreshToken: String,
        accessTokenExpiresAt: String,
        refreshTokenExpiresAt: String
    ) {
        set(accessToken, for: "accessToken")
        set(refreshToken, for: "refreshToken")
        set(accessTokenExpiresAt, for: "accessTokenExpiresAt")
        set(refreshTokenExpiresAt, for: "refreshTokenExpiresAt")
    }

    func getAccessToken() -> String? {
        get(for: "accessToken")
    }

    func getRefreshToken() -> String? {
        get(for: "refreshToken")
    }

    func getAccessTokenExpiresAt() -> Date? {
        guard let str = get(for: "accessTokenExpiresAt") else { return nil }
        return ISO8601DateFormatter().date(from: str)
    }

    func getRefreshTokenExpiresAt() -> Date? {
        guard let str = get(for: "refreshTokenExpiresAt") else { return nil }
        return ISO8601DateFormatter().date(from: str)
    }

    func clear() {
        for key in ["accessToken", "refreshToken", "accessTokenExpiresAt", "refreshTokenExpiresAt"] {
            delete(for: key)
        }
    }

    // MARK: - Keychain Low-Level Operations

    private func set(_ value: String, for key: String) {
        guard let data = value.data(using: .utf8) else { return }

        // Delete existing item first
        delete(for: key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,
        ]

        SecItemAdd(query as CFDictionary, nil)
    }

    private func get(for key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }

        return String(data: data, encoding: .utf8)
    }

    private func delete(for key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]

        SecItemDelete(query as CFDictionary)
    }
}
