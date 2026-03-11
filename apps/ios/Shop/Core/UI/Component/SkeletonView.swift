import SwiftUI

struct SkeletonView: View {
    var width: CGFloat? = nil
    var height: CGFloat = 16
    var radius: CGFloat = ShopDimens.radiusSM

    @State private var isAnimating = false

    var body: some View {
        RoundedRectangle(cornerRadius: radius)
            .fill(Color.shopDivider.opacity(isAnimating ? 0.4 : 0.8))
            .frame(width: width, height: height)
            .animation(
                .easeInOut(duration: 1.0).repeatForever(autoreverses: true),
                value: isAnimating
            )
            .onAppear { isAnimating = true }
    }
}

/// Skeleton placeholder for a product card
struct ProductCardSkeleton: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            SkeletonView(height: ShopDimens.productCardImageHeight, radius: 0)

            VStack(alignment: .leading, spacing: 6) {
                SkeletonView(height: 14)
                SkeletonView(width: 120, height: 14)
                SkeletonView(width: 80, height: 18)
                SkeletonView(width: 100, height: 12)
            }
            .padding(ShopDimens.spacingSM)
        }
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
    }
}

/// Skeleton placeholder for the home page
struct HomeSkeletonView: View {
    private let columns = Array(
        repeating: GridItem(.flexible(), spacing: ShopDimens.gridSpacing),
        count: 2
    )

    var body: some View {
        ScrollView {
            VStack(spacing: ShopDimens.spacingLG) {
                // Search bar skeleton
                SkeletonView(height: ShopDimens.searchBarHeight, radius: ShopDimens.radiusMD)
                    .padding(.horizontal, ShopDimens.spacingLG)

                // Category pills skeleton
                HStack(spacing: ShopDimens.spacingSM) {
                    ForEach(0..<5, id: \.self) { _ in
                        SkeletonView(width: 72, height: ShopDimens.categoryPillHeight, radius: ShopDimens.radiusFull)
                    }
                }
                .padding(.horizontal, ShopDimens.spacingLG)

                // Banner skeleton
                SkeletonView(height: ShopDimens.bannerHeight, radius: ShopDimens.radiusMD)
                    .padding(.horizontal, ShopDimens.spacingLG)

                // Section title skeleton
                SkeletonView(width: 140, height: 20)
                    .padding(.horizontal, ShopDimens.spacingLG)

                // Horizontal product row skeleton
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: ShopDimens.gridSpacing) {
                        ForEach(0..<3, id: \.self) { _ in
                            ProductCardSkeleton()
                                .frame(width: 150)
                        }
                    }
                    .padding(.horizontal, ShopDimens.spacingLG)
                }

                // Grid skeleton
                LazyVGrid(columns: columns, spacing: ShopDimens.gridSpacing) {
                    ForEach(0..<4, id: \.self) { _ in
                        ProductCardSkeleton()
                    }
                }
                .padding(.horizontal, ShopDimens.spacingLG)
            }
            .padding(.vertical, ShopDimens.spacingLG)
        }
    }
}

#Preview {
    HomeSkeletonView()
        .background(Color.shopBackground)
}
