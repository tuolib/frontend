import SwiftUI

@main
struct ShopApp: App {
    @State private var toastManager = ToastManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .overlay(alignment: .top) {
                    if let toast = toastManager.current {
                        ToastView(item: toast)
                            .padding(.top, 50)
                            .animation(.spring(duration: 0.3), value: toastManager.current)
                    }
                }
        }
    }
}
