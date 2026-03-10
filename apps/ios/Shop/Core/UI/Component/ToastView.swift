import SwiftUI

// MARK: - ToastManager

@Observable
final class ToastManager {
    static let shared = ToastManager()

    var current: ToastItem?

    func show(_ message: String, type: ToastType = .success, duration: TimeInterval = 2) {
        withAnimation(.spring(duration: 0.3)) {
            current = ToastItem(message: message, type: type)
        }
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(duration))
            withAnimation(.spring(duration: 0.3)) {
                current = nil
            }
        }
    }

    func dismiss() {
        withAnimation(.spring(duration: 0.3)) {
            current = nil
        }
    }
}

// MARK: - ToastItem

struct ToastItem: Equatable, Identifiable {
    let id = UUID()
    let message: String
    let type: ToastType
}

// MARK: - ToastType

enum ToastType: Equatable {
    case success
    case error
    case info

    var icon: String {
        switch self {
        case .success: "checkmark.circle.fill"
        case .error: "xmark.circle.fill"
        case .info: "info.circle.fill"
        }
    }

    var backgroundColor: Color {
        switch self {
        case .success: .shopSuccess
        case .error: .shopError
        case .info: .shopPrimary
        }
    }
}

// MARK: - ToastView

struct ToastView: View {
    let item: ToastItem

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: item.type.icon)
            Text(item.message)
                .font(ShopFonts.subheadline)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(item.type.backgroundColor)
        .foregroundStyle(.white)
        .clipShape(Capsule())
        .shadow(color: .black.opacity(0.15), radius: 8, y: 4)
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}

#Preview {
    VStack(spacing: 20) {
        ToastView(item: ToastItem(message: "Added to cart", type: .success))
        ToastView(item: ToastItem(message: "Network error", type: .error))
        ToastView(item: ToastItem(message: "Item saved", type: .info))
    }
    .padding()
}
