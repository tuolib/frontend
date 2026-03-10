import Foundation

enum PriceFormatter {
    private static let formatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.minimumFractionDigits = 2
        f.maximumFractionDigits = 2
        return f
    }()

    /// Format string price (product list/detail API)
    /// "7999.00" → "7,999.00"
    static func format(_ price: String) -> String {
        guard let decimal = Decimal(string: price) else { return price }
        return formatter.string(from: decimal as NSDecimalNumber) ?? price
    }

    /// Format numeric price (cart/order API)
    /// 7999.0 → "7,999.00"
    static func format(_ price: Double) -> String {
        formatter.string(from: NSNumber(value: price)) ?? String(format: "%.2f", price)
    }

    /// With ¥ symbol — string price
    static func withSymbol(_ price: String) -> String { "¥\(format(price))" }

    /// With ¥ symbol — numeric price
    static func withSymbol(_ price: Double) -> String { "¥\(format(price))" }

    /// Integer part for large price display
    static func integerPart(_ price: String) -> String {
        guard let dotIndex = format(price).firstIndex(of: ".") else {
            return format(price)
        }
        return String(format(price)[..<dotIndex])
    }

    /// Fraction part for large price display (e.g. ".00")
    static func fractionPart(_ price: String) -> String {
        guard let dotIndex = format(price).firstIndex(of: ".") else {
            return ".00"
        }
        return String(format(price)[dotIndex...])
    }

    /// Integer part — numeric price
    static func integerPart(_ price: Double) -> String {
        guard let dotIndex = format(price).firstIndex(of: ".") else {
            return format(price)
        }
        return String(format(price)[..<dotIndex])
    }

    /// Fraction part — numeric price
    static func fractionPart(_ price: Double) -> String {
        guard let dotIndex = format(price).firstIndex(of: ".") else {
            return ".00"
        }
        return String(format(price)[dotIndex...])
    }

    /// Calculate discount percentage
    /// Returns "20%" for price "7999" vs comparePrice "9999"
    static func discountPercent(price: String, comparePrice: String) -> String? {
        guard let p = Double(price), let cp = Double(comparePrice), cp > p, cp > 0 else {
            return nil
        }
        let percent = Int(((cp - p) / cp) * 100)
        return percent > 0 ? "-\(percent)%" : nil
    }
}
