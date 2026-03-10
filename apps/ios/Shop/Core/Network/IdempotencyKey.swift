import Foundation

enum IdempotencyKey {
    static func generate() -> String {
        UUID().uuidString
    }
}
