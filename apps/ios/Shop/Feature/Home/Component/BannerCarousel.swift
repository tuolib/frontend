import SwiftUI
import Kingfisher

struct BannerCarousel: View {
    let banners: [Banner]
    var onBannerTap: ((Banner) -> Void)?

    @State private var currentIndex = 0
    @State private var timer: Timer?

    var body: some View {
        if !banners.isEmpty {
            VStack(spacing: 8) {
                TabView(selection: $currentIndex) {
                    ForEach(Array(banners.enumerated()), id: \.element.id) { index, banner in
                        Button {
                            onBannerTap?(banner)
                        } label: {
                            KFImage(URL(string: banner.imageUrl))
                                .placeholder {
                                    Rectangle()
                                        .fill(Color.shopBackground)
                                        .overlay {
                                            Image(systemName: "photo")
                                                .font(.system(size: 40))
                                                .foregroundStyle(Color.shopDivider)
                                        }
                                }
                                .resizable()
                                .aspectRatio(16 / 9, contentMode: .fill)
                                .clipped()
                                .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                        }
                        .buttonStyle(.plain)
                        .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(height: ShopDimens.bannerHeight)

                // Page indicator dots
                HStack(spacing: 6) {
                    ForEach(0..<banners.count, id: \.self) { index in
                        Circle()
                            .fill(index == currentIndex ? Color.shopPrimary : Color.shopDivider)
                            .frame(width: 6, height: 6)
                    }
                }
            }
            .onAppear { startAutoScroll() }
            .onDisappear { stopAutoScroll() }
        }
    }

    private func startAutoScroll() {
        stopAutoScroll()
        timer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.3)) {
                currentIndex = (currentIndex + 1) % max(banners.count, 1)
            }
        }
    }

    private func stopAutoScroll() {
        timer?.invalidate()
        timer = nil
    }
}
