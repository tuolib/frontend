import Foundation

enum ShopDateFormatter {
    /// ISO 8601 parser for API dates
    nonisolated(unsafe) static let iso8601: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    /// Display format: "Mar 10, 2026"
    static let display: DateFormatter = {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .none
        return f
    }()

    /// Display format with time: "Mar 10, 2026 14:30"
    static let displayWithTime: DateFormatter = {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .short
        return f
    }()

    /// Relative time: "2 hours ago", "Yesterday"
    nonisolated(unsafe) static let relative: RelativeDateTimeFormatter = {
        let f = RelativeDateTimeFormatter()
        f.unitsStyle = .short
        return f
    }()
}

// MARK: - String Date Extensions

extension String {
    /// Parse ISO 8601 date string to Date
    var toDate: Date? {
        ShopDateFormatter.iso8601.date(from: self)
    }

    /// Format ISO 8601 string to display format
    var toDisplayDate: String {
        guard let date = toDate else { return self }
        return ShopDateFormatter.display.string(from: date)
    }

    /// Format ISO 8601 string to display format with time
    var toDisplayDateTime: String {
        guard let date = toDate else { return self }
        return ShopDateFormatter.displayWithTime.string(from: date)
    }

    /// Format ISO 8601 string to relative time
    var toRelativeTime: String {
        guard let date = toDate else { return self }
        return ShopDateFormatter.relative.localizedString(for: date, relativeTo: Date.now)
    }
}
