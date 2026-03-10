import SwiftUI

extension Color {
    /// Primary dark background — #131921
    static let shopPrimary = Color(hex: "#131921")
    /// Accent / CTA button — #FF9900
    static let shopAccent = Color(hex: "#FF9900")
    /// Accent pressed state — #E68A00
    static let shopAccentPressed = Color(hex: "#E68A00")
    /// Price text — #B12704
    static let shopPrice = Color(hex: "#B12704")
    /// Teal links / selected — #007185
    static let shopTeal = Color(hex: "#007185")
    /// Success state — #067D62
    static let shopSuccess = Color(hex: "#067D62")
    /// Background gray — #EAEDED
    static let shopBackground = Color(hex: "#EAEDED")
    /// Card white — #FFFFFF
    static let shopCard = Color.white
    /// Primary text — #0F1111
    static let shopText = Color(hex: "#0F1111")
    /// Secondary text — #565959
    static let shopTextSecondary = Color(hex: "#565959")
    /// Divider — #DDDDDD
    static let shopDivider = Color(hex: "#DDDDDD")
    /// Star rating — #FFA41C
    static let shopStar = Color(hex: "#FFA41C")
    /// Error / destructive — #D13212
    static let shopError = Color(hex: "#D13212")
}

// MARK: - Hex Initializer

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)

        let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000FF) / 255.0

        self.init(red: r, green: g, blue: b)
    }
}
