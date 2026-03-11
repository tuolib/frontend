import SwiftUI

struct NewArrivalsSection: View {
    let products: [Product]
    var onProductTap: ((Product) -> Void)?

    var body: some View {
        DealSection(
            title: "New Arrivals",
            products: products,
            onProductTap: onProductTap
        )
    }
}
