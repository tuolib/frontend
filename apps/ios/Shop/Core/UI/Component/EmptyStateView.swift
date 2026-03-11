import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let title: String
    var message: String? = nil
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: ShopDimens.spacingLG) {
            Image(systemName: icon)
                .font(.system(size: 56))
                .foregroundStyle(Color.shopDivider)

            Text(title)
                .font(ShopFonts.title3)
                .foregroundStyle(Color.shopText)

            if let message {
                Text(message)
                    .font(ShopFonts.subheadline)
                    .foregroundStyle(Color.shopTextSecondary)
                    .multilineTextAlignment(.center)
            }

            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .font(ShopFonts.bodySemibold)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(Color.shopAccent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
            }
        }
        .padding(ShopDimens.spacingXXXL)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    EmptyStateView(
        icon: "magnifyingglass",
        title: "No results found",
        message: "Try a different search term",
        actionTitle: "Browse All",
        action: {}
    )
}
