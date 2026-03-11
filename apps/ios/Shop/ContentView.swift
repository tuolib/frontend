import SwiftUI
import ComposableArchitecture

struct ContentView: View {
    @State private var isLoggedIn: Bool
    @State private var showLoginSheet = false

    init() {
        _isLoggedIn = State(initialValue: AuthManager.shared.isLoggedInSync)
    }

    var body: some View {
        MainTabView(
            showLoginSheet: $showLoginSheet,
            isLoggedIn: $isLoggedIn
        )
        .sheet(isPresented: $showLoginSheet) {
            NavigationStack {
                LoginView(
                    store: Store(initialState: LoginFeature.State()) {
                        LoginFeature()
                    },
                    onDismiss: {
                        showLoginSheet = false
                        isLoggedIn = AuthManager.shared.isLoggedInSync
                    }
                )
            }
            .interactiveDismissDisabled(false)
        }
    }

    func requireAuth(then action: @escaping () -> Void) {
        if isLoggedIn {
            action()
        } else {
            showLoginSheet = true
        }
    }
}

#Preview {
    ContentView()
}
