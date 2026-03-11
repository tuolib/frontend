import SwiftUI
import ComposableArchitecture

struct ProductListView: View {
    @Bindable var store: StoreOf<ProductListFeature>
    var onProductTap: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Sort bar
            SortBar(
                selected: currentSortOption,
                onSelect: { option in
                    store.send(.changeSort(option.sort, option.order))
                }
            )

            // Content
            if store.pagination.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if store.pagination.isEmpty {
                EmptyStateView(
                    icon: "tray",
                    title: "No products found",
                    message: "Try a different category or filter"
                )
            } else {
                ScrollView {
                    ProductGrid(
                        products: store.pagination.items,
                        isLoadingMore: store.pagination.isLoadingMore,
                        hasMore: store.pagination.hasMore,
                        onLoadMore: { store.send(.loadNextPage) },
                        onProductTap: { onProductTap($0.id) }
                    )
                    .padding(ShopDimens.spacingLG)
                }
                .refreshable { store.send(.refresh) }
            }
        }
        .background(Color.shopBackground)
        .navigationTitle(store.categoryName ?? "Products")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { store.send(.onAppear) }
    }

    private var currentSortOption: SortOption {
        SortOption.options.first { $0.sort == store.sort && $0.order == store.order }
            ?? SortOption.options[0]
    }
}
