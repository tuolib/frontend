import Foundation

extension DateFormatter {
    /// ISO 8601 parser for API dates
    static let iso8601: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    /// Display format: "Mar 10, 2026"
    static let shopDisplay: DateFormatter = {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .none
        return f
    }()

    /// Display format with time: "Mar 10, 2026 14:30"
    static let shopDisplayWithTime: DateFormatter = {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .short
        return f
    }()

    /// Relative time: "2 hours ago", "Yesterday"
    static let shopRelative: RelativeDateTimeFormatter = {
        let f = RelativeDateTimeFormatter()
        f.unitsStyle = .short
        return f
    }()
}

// MARK: - String Date Extensions

extension String {
    /// Parse ISO 8601 date string to Date
    var toDate: Date? {
        DateFormatter.iso8601.date(from: self)
    }

    /// Format ISO 8601 string to display format
    var toDisplayDate: String {
        guard let date = toDate else { return self }
        return DateFormatter.shopDisplay.string(from: date)
    }

    /// Format ISO 8601 string to display format with time
    var toDisplayDateTime: String {
        guard let date = toDate else { return self }
        return DateFormatter.shopDisplayWithTime.string(from: date)
    }

    /// Format ISO 8601 string to relative time
    var toRelativeTime: String {
        guard let date = toDate else { return self }
        return DateFormatter.shopRelative.localizedString(for: date, relativeTo: Date.now)
    }
}
