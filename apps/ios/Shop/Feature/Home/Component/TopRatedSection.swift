import SwiftUI

struct TopRatedSection: View {
    let products: [Product]
    var onProductTap: ((Product) -> Void)?

    var body: some View {
        DealSection(
            title: "Top Rated",
            products: products,
            onProductTap: onProductTap
        )
    }
}
