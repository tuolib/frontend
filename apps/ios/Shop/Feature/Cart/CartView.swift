import SwiftUI
import ComposableArchitecture
import Kingfisher

struct CartView: View {
    @Bindable var store: StoreOf<CartFeature>
    var isLoggedIn: Bool
    var onSignInTapped: () -> Void
    var onProductTap: (String) -> Void
    var onCheckout: () -> Void

    var body: some View {
        Group {
            if !isLoggedIn {
                notLoggedInView
            } else if store.isLoading && !store.hasLoaded {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if store.items.isEmpty {
                EmptyStateView(
                    icon: "cart",
                    title: "Your cart is empty",
                    message: "Browse products and add items to your cart"
                )
            } else {
                cartContent
            }
        }
        .background(Color.shopBackground)
        .navigationTitle("Shopping Cart (\(store.items.count))")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if isLoggedIn { store.send(.onAppear) }
        }
    }

    // MARK: - Not Logged In

    private var notLoggedInView: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart")
                .font(.system(size: 48))
                .foregroundStyle(Color.shopAccent)
            Text("Sign in to see your cart")
                .font(ShopFonts.body)
                .foregroundStyle(Color.shopTextSecondary)
            Button("Sign In") {
                onSignInTapped()
            }
            .fontWeight(.semibold)
            .padding(.horizontal, 32)
            .padding(.vertical, 12)
            .background(Color.shopAccent)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Cart Content

    private var cartContent: some View {
        VStack(spacing: 0) {
            List {
                ForEach(store.items) { item in
                    cartItemRow(item)
                        .listRowInsets(EdgeInsets(
                            top: ShopDimens.spacingSM,
                            leading: ShopDimens.spacingLG,
                            bottom: ShopDimens.spacingSM,
                            trailing: ShopDimens.spacingLG
                        ))
                        .listRowSeparator(.hidden)
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                store.send(.removeItem(item.skuId))
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                }
            }
            .listStyle(.plain)
            .refreshable { store.send(.refresh) }

            // Bottom checkout bar
            checkoutBar
        }
    }

    // MARK: - Cart Item Row

    private func cartItemRow(_ item: CartItem) -> some View {
        HStack(alignment: .top, spacing: ShopDimens.spacingMD) {
            // Checkbox
            Button {
                store.send(.toggleSelect(item.skuId))
            } label: {
                Image(systemName: item.selected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundStyle(item.selected ? Color.shopTeal : Color.shopDivider)
            }
            .buttonStyle(.plain)

            // Product image
            Button {
                onProductTap(item.snapshot.productId)
            } label: {
                KFImage(URL(string: item.snapshot.imageUrl ?? ""))
                    .placeholder {
                        Color.shopBackground
                            .overlay {
                                Image(systemName: "photo")
                                    .foregroundStyle(Color.shopDivider)
                            }
                    }
                    .resizable()
                    .scaledToFill()
                    .frame(width: 80, height: 80)
                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
            }
            .buttonStyle(.plain)

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(item.snapshot.productTitle)
                    .font(ShopFonts.subheadline)
                    .foregroundStyle(Color.shopText)
                    .lineLimit(2)

                // SKU attributes
                if let attrs = item.snapshot.skuAttrs {
                    let attrText = attrs.values.joined(separator: " / ")
                    if !attrText.isEmpty {
                        Text(attrText)
                            .font(ShopFonts.caption)
                            .foregroundStyle(Color.shopTextSecondary)
                            .lineLimit(1)
                    }
                }

                HStack {
                    PriceText(item.currentPrice, size: .small)
                    Spacer()
                    QuantityStepper(
                        quantity: item.quantity,
                        min: 1,
                        max: item.currentStock,
                        onChange: { store.send(.updateQuantity(skuId: item.skuId, quantity: $0)) }
                    )
                }
            }
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
    }

    // MARK: - Checkout Bar

    private var checkoutBar: some View {
        VStack(spacing: 0) {
            Divider()
            HStack(spacing: ShopDimens.spacingMD) {
                // Select all
                Button {
                    store.send(.toggleSelectAll)
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: store.isAllSelected ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 20))
                            .foregroundStyle(store.isAllSelected ? Color.shopTeal : Color.shopDivider)
                        Text("All")
                            .font(ShopFonts.subheadline)
                            .foregroundStyle(Color.shopText)
                    }
                }
                .buttonStyle(.plain)

                Spacer()

                // Total
                VStack(alignment: .trailing, spacing: 2) {
                    HStack(spacing: 2) {
                        Text("Total:")
                            .font(ShopFonts.subheadline)
                            .foregroundStyle(Color.shopText)
                        PriceText(store.totalAmount, size: .normal)
                    }
                    Text("\(store.totalQuantity) items")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                }

                // Checkout button
                Button {
                    store.send(.checkout)
                    onCheckout()
                } label: {
                    Text("Checkout")
                        .font(ShopFonts.bodySemibold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(store.selectedItems.isEmpty ? Color.shopAccent.opacity(0.5) : Color.shopAccent)
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                }
                .disabled(store.selectedItems.isEmpty)
            }
            .padding(.horizontal, ShopDimens.spacingLG)
            .padding(.vertical, ShopDimens.spacingMD)
            .background(Color.shopCard)
        }
    }
}
