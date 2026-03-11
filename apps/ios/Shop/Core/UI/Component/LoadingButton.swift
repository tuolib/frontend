import SwiftUI

struct LoadingButton: View {
    let title: String
    let isLoading: Bool
    var style: ButtonStyle = .primary
    let action: () -> Void

    enum ButtonStyle {
        case primary, secondary, accent

        var backgroundColor: Color {
            switch self {
            case .primary: .shopAccent
            case .secondary: .shopPrimary
            case .accent: .shopTeal
            }
        }
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                }
                Text(title)
                    .font(ShopFonts.bodySemibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(isLoading ? style.backgroundColor.opacity(0.7) : style.backgroundColor)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        }
        .disabled(isLoading)
    }
}

#Preview {
    VStack(spacing: 16) {
        LoadingButton(title: "Add to Cart", isLoading: false, action: {})
        LoadingButton(title: "Adding...", isLoading: true, action: {})
        LoadingButton(title: "Buy Now", isLoading: false, style: .secondary, action: {})
    }
    .padding()
}
