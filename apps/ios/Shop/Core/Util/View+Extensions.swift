import SwiftUI

// MARK: - Conditional Modifier

extension View {
    /// Apply a modifier conditionally
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    /// Apply a modifier when an optional value is non-nil
    @ViewBuilder
    func ifLet<T, Content: View>(_ value: T?, transform: (Self, T) -> Content) -> some View {
        if let value {
            transform(self, value)
        } else {
            self
        }
    }
}

// MARK: - Loading Overlay

extension View {
    func loadingOverlay(_ isLoading: Bool) -> some View {
        overlay {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(.ultraThinMaterial)
            }
        }
    }
}

// MARK: - Shop Card Style

extension View {
    func shopCard(padding: CGFloat = ShopDimens.spacingLG) -> some View {
        self
            .padding(padding)
            .background(Color.shopCard)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
    }
}

// MARK: - Hide Keyboard

extension View {
    func hideKeyboardOnTap() -> some View {
        onTapGesture {
            UIApplication.shared.sendAction(
                #selector(UIResponder.resignFirstResponder),
                to: nil, from: nil, for: nil
            )
        }
    }
}
