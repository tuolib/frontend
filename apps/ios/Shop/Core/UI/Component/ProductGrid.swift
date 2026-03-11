import SwiftUI
import ComposableArchitecture

struct ProductGrid: View {
    let products: IdentifiedArrayOf<Product>
    let isLoadingMore: Bool
    let hasMore: Bool
    var onLoadMore: (() -> Void)?
    var onProductTap: ((Product) -> Void)?

    private let columns = Array(
        repeating: GridItem(.flexible(), spacing: ShopDimens.gridSpacing),
        count: ShopDimens.gridColumns
    )

    var body: some View {
        LazyVGrid(columns: columns, spacing: ShopDimens.gridSpacing) {
            ForEach(products) { product in
                ProductCard(product: product) {
                    onProductTap?(product)
                }
                .onAppear {
                    if product.id == products.last?.id, hasMore {
                        onLoadMore?()
                    }
                }
            }
        }

        if isLoadingMore {
            ProgressView()
                .frame(maxWidth: .infinity)
                .padding(.vertical, ShopDimens.spacingLG)
        }
    }
}
