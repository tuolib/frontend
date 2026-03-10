import SwiftUI

enum ShopFonts {
    // MARK: - Heading

    /// Large title — 28pt Bold
    static let largeTitle = Font.system(size: 28, weight: .bold)
    /// Title — 22pt Bold
    static let title = Font.system(size: 22, weight: .bold)
    /// Title 2 — 20pt Semibold
    static let title2 = Font.system(size: 20, weight: .semibold)
    /// Title 3 — 18pt Semibold
    static let title3 = Font.system(size: 18, weight: .semibold)

    // MARK: - Body

    /// Body — 16pt Regular
    static let body = Font.system(size: 16)
    /// Body Semibold — 16pt Semibold
    static let bodySemibold = Font.system(size: 16, weight: .semibold)

    // MARK: - Small

    /// Subheadline — 14pt Regular
    static let subheadline = Font.system(size: 14)
    /// Subheadline Semibold — 14pt Semibold
    static let subheadlineSemibold = Font.system(size: 14, weight: .semibold)
    /// Caption — 12pt Regular
    static let caption = Font.system(size: 12)
    /// Caption Semibold — 12pt Semibold
    static let captionSemibold = Font.system(size: 12, weight: .semibold)

    // MARK: - Price

    /// Price large — 24pt Bold
    static let priceLarge = Font.system(size: 24, weight: .bold)
    /// Price normal — 18pt Bold
    static let priceNormal = Font.system(size: 18, weight: .bold)
    /// Price small — 14pt Bold
    static let priceSmall = Font.system(size: 14, weight: .bold)
    /// Price fraction — 12pt Bold
    static let priceFraction = Font.system(size: 12, weight: .bold)
}
