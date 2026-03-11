import SwiftUI

struct SortOption: Equatable, Identifiable {
    let id: String
    let label: String
    let sort: String
    let order: String

    static let options: [SortOption] = [
        SortOption(id: "newest", label: "Newest", sort: "createdAt", order: "desc"),
        SortOption(id: "sales", label: "Best Sellers", sort: "sales", order: "desc"),
        SortOption(id: "priceAsc", label: "Price: Low to High", sort: "price", order: "asc"),
        SortOption(id: "priceDesc", label: "Price: High to Low", sort: "price", order: "desc"),
    ]
}

struct SortBar: View {
    let selected: SortOption
    let onSelect: (SortOption) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: ShopDimens.spacingSM) {
                ForEach(SortOption.options) { option in
                    Button {
                        onSelect(option)
                    } label: {
                        Text(option.label)
                            .font(ShopFonts.subheadline)
                            .foregroundStyle(option.id == selected.id ? .white : Color.shopText)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(option.id == selected.id ? Color.shopPrimary : Color.shopBackground)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, ShopDimens.spacingLG)
        }
        .padding(.vertical, ShopDimens.spacingSM)
        .background(Color.shopCard)
    }
}

#Preview {
    SortBar(selected: SortOption.options[0]) { _ in }
}
