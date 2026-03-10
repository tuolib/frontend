import Foundation

final class SearchHistoryStore: Sendable {
    static let shared = SearchHistoryStore()

    private let key = "search_history"
    private let maxItems = 10

    func getHistory() -> [String] {
        UserDefaults.standard.stringArray(forKey: key) ?? []
    }

    func addKeyword(_ keyword: String) {
        var history = getHistory()
        // Remove duplicate if exists
        history.removeAll { $0 == keyword }
        // Insert at front
        history.insert(keyword, at: 0)
        // Trim to max
        if history.count > maxItems {
            history = Array(history.prefix(maxItems))
        }
        UserDefaults.standard.set(history, forKey: key)
    }

    func clear() {
        UserDefaults.standard.removeObject(forKey: key)
    }
}
