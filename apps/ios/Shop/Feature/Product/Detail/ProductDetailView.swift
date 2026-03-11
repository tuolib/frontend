import SwiftUI
import ComposableArchitecture

struct ProductDetailView: View {
    @Bindable var store: StoreOf<ProductDetailFeature>
    var onCartTap: () -> Void
    var onBuyNow: (() -> Void)?

    var body: some View {
        Group {
            if store.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let detail = store.detail {
                detailContent(detail)
            }
        }
        .background(Color.shopBackground)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    onCartTap()
                } label: {
                    Image(systemName: "cart")
                        .foregroundStyle(Color.shopText)
                }
            }
        }
        .onAppear { store.send(.onAppear) }
    }

    // MARK: - Detail Content

    private func detailContent(_ detail: ProductDetail) -> some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 0) {
                    // Image carousel
                    ImageCarousel(images: detail.images)

                    VStack(alignment: .leading, spacing: ShopDimens.spacingLG) {
                        // Price
                        priceSection

                        // Title
                        Text(detail.title)
                            .font(ShopFonts.bodySemibold)
                            .foregroundStyle(Color.shopText)
                            .lineLimit(3)

                        // Rating
                        if detail.reviewCount > 0 {
                            HStack(spacing: ShopDimens.spacingSM) {
                                RatingStars(rating: detail.avgRating, count: detail.reviewCount)
                                Text("\(detail.totalSales) sold")
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopTextSecondary)
                            }
                        }

                        Divider()

                        // SKU selector
                        if !store.dimensions.isEmpty {
                            SkuSelector(
                                dimensions: store.dimensions,
                                selectedAttributes: store.selectedAttributes,
                                skus: detail.skus,
                                onSelect: { key, value in
                                    store.send(.selectAttribute(key, value))
                                }
                            )

                            // Stock info
                            if let sku = store.selectedSku {
                                HStack {
                                    if sku.stock > 0 {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundStyle(Color.shopSuccess)
                                        Text("In Stock (\(sku.stock))")
                                            .font(ShopFonts.subheadline)
                                            .foregroundStyle(Color.shopSuccess)
                                    } else {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundStyle(Color.shopError)
                                        Text("Out of Stock")
                                            .font(ShopFonts.subheadline)
                                            .foregroundStyle(Color.shopError)
                                    }
                                }
                            }

                            Divider()
                        }

                        // Quantity
                        if store.selectedSku != nil {
                            HStack {
                                Text("Quantity")
                                    .font(ShopFonts.subheadlineSemibold)
                                    .foregroundStyle(Color.shopText)
                                Spacer()
                                QuantityStepper(
                                    quantity: store.quantity,
                                    min: 1,
                                    max: max(1, store.currentStock),
                                    onChange: { store.send(.setQuantity($0)) }
                                )
                            }

                            Divider()
                        }

                        // Description
                        if let description = detail.description, !description.isEmpty {
                            VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
                                Text("About this item")
                                    .font(ShopFonts.bodySemibold)
                                    .foregroundStyle(Color.shopText)
                                Text(description)
                                    .font(ShopFonts.subheadline)
                                    .foregroundStyle(Color.shopTextSecondary)
                                    .lineSpacing(4)
                            }
                        }

                        // Brand
                        if let brand = detail.brand {
                            HStack {
                                Text("Brand")
                                    .font(ShopFonts.subheadlineSemibold)
                                    .foregroundStyle(Color.shopText)
                                Spacer()
                                Text(brand)
                                    .font(ShopFonts.subheadline)
                                    .foregroundStyle(Color.shopTextSecondary)
                            }
                        }
                    }
                    .padding(ShopDimens.spacingLG)
                    .background(Color.shopCard)
                }
            }

            // Bottom bar
            bottomBar
        }
    }

    // MARK: - Price Section

    private var priceSection: some View {
        PriceText(store.displayPrice, comparePrice: store.displayComparePrice, size: .large)
    }

    // MARK: - Bottom Bar

    private var bottomBar: some View {
        HStack(spacing: ShopDimens.spacingMD) {
            LoadingButton(
                title: store.isAddingToCart ? "Adding..." : "Add to Cart",
                isLoading: store.isAddingToCart,
                style: .accent
            ) {
                store.send(.addToCart)
            }
            .disabled(!store.canAddToCart)

            LoadingButton(
                title: "Buy Now",
                isLoading: false,
                style: .primary
            ) {
                store.send(.buyNow)
                onBuyNow?()
            }
            .disabled(store.selectedSku == nil || store.currentStock == 0)
        }
        .padding(.horizontal, ShopDimens.spacingLG)
        .padding(.vertical, ShopDimens.spacingMD)
        .background(Color.shopCard)
        .shadow(color: .black.opacity(0.05), radius: 4, y: -2)
    }
}
