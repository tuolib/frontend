import SwiftUI
import ComposableArchitecture

struct SearchView: View {
    @Bindable var store: StoreOf<SearchFeature>
    @FocusState private var isSearchFocused: Bool
    @Environment(\.dismiss) private var dismiss
    var onProductTap: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Search bar
            searchBar

            // Content
            switch store.phase {
            case .idle:
                idleContent
            case .searching:
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .results:
                resultsContent
            case .empty:
                EmptyStateView(
                    icon: "magnifyingglass",
                    title: "No results found",
                    message: "Try a different search term"
                )
            }
        }
        .background(Color.shopBackground)
        .navigationBarHidden(true)
        .onAppear {
            store.send(.onAppear)
            isSearchFocused = true
        }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: ShopDimens.spacingSM) {
            HStack(spacing: ShopDimens.spacingSM) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Color.shopTextSecondary)
                    .font(.system(size: 16))

                TextField("Search products...", text: $store.keyword)
                    .font(ShopFonts.subheadline)
                    .focused($isSearchFocused)
                    .submitLabel(.search)
                    .onSubmit { store.send(.submitSearch) }

                if !store.keyword.isEmpty {
                    Button {
                        store.keyword = ""
                        isSearchFocused = true
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Color.shopTextSecondary)
                            .font(.system(size: 16))
                    }
                }
            }
            .padding(.horizontal, ShopDimens.spacingMD)
            .frame(height: ShopDimens.searchBarHeight)
            .background(Color.shopCard)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))

            Button("Cancel") {
                dismiss()
            }
            .font(ShopFonts.subheadline)
            .foregroundStyle(Color.shopTeal)
        }
        .padding(.horizontal, ShopDimens.spacingLG)
        .padding(.vertical, ShopDimens.spacingSM)
        .background(Color.shopPrimary)
    }

    // MARK: - Idle (History)

    private var idleContent: some View {
        ScrollView {
            if !store.history.isEmpty {
                VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
                    HStack {
                        Text("Recent Searches")
                            .font(ShopFonts.bodySemibold)
                            .foregroundStyle(Color.shopText)
                        Spacer()
                        Button("Clear") {
                            store.send(.clearHistory)
                        }
                        .font(ShopFonts.subheadline)
                        .foregroundStyle(Color.shopTeal)
                    }

                    FlowLayout(spacing: ShopDimens.spacingSM) {
                        ForEach(store.history, id: \.self) { keyword in
                            Button {
                                store.send(.selectKeyword(keyword))
                            } label: {
                                Text(keyword)
                                    .font(ShopFonts.subheadline)
                                    .foregroundStyle(Color.shopText)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.shopCard)
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }
                .padding(ShopDimens.spacingLG)
            }
        }
    }

    // MARK: - Results

    private var resultsContent: some View {
        VStack(spacing: 0) {
            // Sort bar
            searchSortBar

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
        }
    }

    private var searchSortBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: ShopDimens.spacingSM) {
                sortButton("Relevance", sort: nil, order: nil)
                sortButton("Price ↑", sort: "price", order: "asc")
                sortButton("Price ↓", sort: "price", order: "desc")
                sortButton("Sales", sort: "sales", order: "desc")
                sortButton("Newest", sort: "createdAt", order: "desc")
            }
            .padding(.horizontal, ShopDimens.spacingLG)
        }
        .padding(.vertical, ShopDimens.spacingSM)
        .background(Color.shopCard)
    }

    private func sortButton(_ label: String, sort: String?, order: String?) -> some View {
        let isSelected = store.sort == sort && store.order == order
        return Button {
            store.send(.changeSort(sort, order))
        } label: {
            Text(label)
                .font(ShopFonts.subheadline)
                .foregroundStyle(isSelected ? .white : Color.shopText)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.shopPrimary : Color.shopBackground)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - FlowLayout (tag cloud)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x)
        }

        return (positions, CGSize(width: maxX, height: y + rowHeight))
    }
}
