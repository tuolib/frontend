import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "cart.fill")
                .font(.system(size: 60))
                .foregroundStyle(Color.shopAccent)

            Text("Shop")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundStyle(Color.shopText)

            Text("Phase 1 — Core Infrastructure Ready")
                .font(.subheadline)
                .foregroundStyle(Color.shopTextSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.shopBackground)
    }
}

#Preview {
    ContentView()
}
