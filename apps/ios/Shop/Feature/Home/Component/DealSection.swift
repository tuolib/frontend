import SwiftUI
import Kingfisher

struct DealSection: View {
    let title: String
    let products: [Product]
    var showCountdown: Bool = false
    var onProductTap: ((Product) -> Void)?
    var onSeeAll: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            // Section header
            HStack {
                Text(title)
                    .font(ShopFonts.title3)
                    .foregroundStyle(Color.shopText)

                if showCountdown {
                    CountdownTimer()
                }

                Spacer()

                if let onSeeAll {
                    Button {
                        onSeeAll()
                    } label: {
                        Text("See all")
                            .font(ShopFonts.subheadline)
                            .foregroundStyle(Color.shopTeal)
                    }
                }
            }
            .padding(.horizontal, ShopDimens.spacingLG)

            // Horizontal scroll
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: ShopDimens.gridSpacing) {
                    ForEach(products) { product in
                        dealItem(product)
                    }
                }
                .padding(.horizontal, ShopDimens.spacingLG)
            }
        }
    }

    private func dealItem(_ product: Product) -> some View {
        Button {
            onProductTap?(product)
        } label: {
            VStack(alignment: .leading, spacing: 4) {
                // Image with discount badge
                ZStack(alignment: .topLeading) {
                    KFImage(URL(string: product.primaryImage ?? ""))
                        .placeholder {
                            Color.shopBackground
                                .overlay {
                                    Image(systemName: "photo")
                                        .foregroundStyle(Color.shopDivider)
                                }
                        }
                        .resizable()
                        .scaledToFill()
                        .frame(width: 120, height: 120)
                        .clipped()
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))

                    // Discount badge
                    if let discount = discountPercent(product) {
                        Text("-\(discount)%")
                            .font(ShopFonts.captionSemibold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.shopPrice)
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                            .padding(4)
                    }
                }

                // Price
                if let price = product.minPrice {
                    PriceText(price, size: .small)
                }

                // Sales
                if product.totalSales > 0 {
                    Text("\(product.totalSales)+ bought")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                        .lineLimit(1)
                } else {
                    Text("New")
                        .font(ShopFonts.captionSemibold)
                        .foregroundStyle(Color.shopTeal)
                }
            }
            .frame(width: 120)
        }
        .buttonStyle(.plain)
    }

    private func discountPercent(_ product: Product) -> Int? {
        guard let minStr = product.minPrice, let maxStr = product.maxPrice,
              let minP = Double(minStr), let maxP = Double(maxStr),
              maxP > minP, maxP > 0 else { return nil }
        let pct = Int(((maxP - minP) / maxP) * 100)
        return pct > 0 ? pct : nil
    }
}

// MARK: - Countdown Timer

struct CountdownTimer: View {
    @State private var remaining = CountdownTimer.timeUntilEndOfDay()

    var body: some View {
        HStack(spacing: 2) {
            timerBox(String(format: "%02d", remaining.hours))
            Text(":").font(ShopFonts.captionSemibold).foregroundStyle(Color.shopPrice)
            timerBox(String(format: "%02d", remaining.minutes))
            Text(":").font(ShopFonts.captionSemibold).foregroundStyle(Color.shopPrice)
            timerBox(String(format: "%02d", remaining.seconds))
        }
        .onReceive(
            Timer.publish(every: 1, on: .main, in: .common).autoconnect()
        ) { _ in
            remaining = CountdownTimer.timeUntilEndOfDay()
        }
    }

    private func timerBox(_ text: String) -> some View {
        Text(text)
            .font(ShopFonts.captionSemibold)
            .monospacedDigit()
            .foregroundStyle(.white)
            .padding(.horizontal, 4)
            .padding(.vertical, 2)
            .background(Color.shopPrice)
            .clipShape(RoundedRectangle(cornerRadius: 3))
    }

    private static func timeUntilEndOfDay() -> (hours: Int, minutes: Int, seconds: Int) {
        let now = Date()
        let calendar = Calendar.current
        guard let endOfDay = calendar.date(
            bySettingHour: 23, minute: 59, second: 59, of: now
        ) else { return (0, 0, 0) }
        let diff = max(0, Int(endOfDay.timeIntervalSince(now)))
        return (diff / 3600, (diff % 3600) / 60, diff % 60)
    }
}
