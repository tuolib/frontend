import SwiftUI

extension AppStorage {
    /// Convenience initializer with default value and custom key
    init(wrappedValue: Value, shop key: String) where Value == Bool {
        self.init(wrappedValue: wrappedValue, key)
    }
}
