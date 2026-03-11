import Foundation
import ComposableArchitecture

@Reducer
struct ProductDetailFeature {
    @ObservableState
    struct State: Equatable {
        let productId: String
        var detail: ProductDetail?
        var selectedAttributes: [String: String] = [:]
        var quantity: Int = 1
        var isLoading = false
        var hasError = false
        var isAddingToCart = false
        var buyNowComplete = false

        /// Extract attribute dimensions from SKUs
        /// e.g. ["颜色": ["黑色","白色"], "内存": ["128GB","256GB"]]
        var dimensions: [(key: String, values: [String])] {
            guard let skus = detail?.skus else { return [] }
            var dimensionMap: [String: [String]] = [:]
            var keyOrder: [String] = []
            for sku in skus {
                for (key, value) in sku.attributes {
                    if dimensionMap[key] == nil {
                        keyOrder.append(key)
                        dimensionMap[key] = []
                    }
                    if !(dimensionMap[key]?.contains(value) ?? false) {
                        dimensionMap[key]?.append(value)
                    }
                }
            }
            return keyOrder.map { (key: $0, values: dimensionMap[$0] ?? []) }
        }

        /// Match the selected SKU based on selected attributes
        var selectedSku: Sku? {
            guard let skus = detail?.skus, !selectedAttributes.isEmpty else { return nil }
            return skus.first { sku in
                selectedAttributes.allSatisfy { key, value in
                    sku.attributes[key] == value
                }
            }
        }

        var displayPrice: String {
            if let sku = selectedSku {
                return sku.price
            }
            return detail?.minPrice ?? "0"
        }

        var displayComparePrice: String? {
            if let sku = selectedSku {
                return sku.comparePrice
            }
            return detail?.maxPrice != detail?.minPrice ? detail?.maxPrice : nil
        }

        var currentStock: Int {
            selectedSku?.stock ?? 0
        }

        var canAddToCart: Bool {
            selectedSku != nil && currentStock > 0 && !isAddingToCart
        }
    }

    enum Action {
        case onAppear
        case retry
        case detailLoaded(Result<ProductDetail, Error>)
        case selectAttribute(String, String)
        case setQuantity(Int)
        case addToCart
        case addToCartResponse(Result<VoidResult, Error>)
        case buyNow
        case buyNowResponse(Result<VoidResult, Error>)
    }

    @Dependency(\.productClient) var productClient
    @Dependency(\.cartClient) var cartClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard state.detail == nil else { return .none }
                state.isLoading = true
                state.hasError = false
                return .run { [id = state.productId] send in
                    let result = await Result { try await productClient.detail(id) }
                    await send(.detailLoaded(result))
                }

            case .retry:
                state.isLoading = true
                state.hasError = false
                return .run { [id = state.productId] send in
                    let result = await Result { try await productClient.detail(id) }
                    await send(.detailLoaded(result))
                }

            case let .detailLoaded(.success(detail)):
                state.isLoading = false
                state.detail = detail
                // Auto-select first available SKU's attributes
                if let firstActiveSku = detail.skus.first(where: { $0.stock > 0 && $0.status == "active" }) {
                    state.selectedAttributes = firstActiveSku.attributes
                } else if let firstSku = detail.skus.first {
                    state.selectedAttributes = firstSku.attributes
                }
                return .none

            case .detailLoaded(.failure):
                state.isLoading = false
                state.hasError = true
                return .run { _ in
                    await ToastManager.shared.show("Failed to load product", type: .error)
                }

            case let .selectAttribute(key, value):
                if state.selectedAttributes[key] == value {
                    return .none
                }
                state.selectedAttributes[key] = value
                // Reset quantity if stock changed
                if let sku = state.selectedSku, state.quantity > sku.stock {
                    state.quantity = max(1, sku.stock)
                }
                return .none

            case let .setQuantity(qty):
                state.quantity = qty
                return .none

            case .addToCart:
                guard let sku = state.selectedSku else { return .none }
                state.isAddingToCart = true
                return .run { [skuId = sku.id, qty = state.quantity] send in
                    let result = await Result {
                        try await cartClient.add(skuId, qty)
                        return VoidResult()
                    }
                    await send(.addToCartResponse(result))
                }

            case .addToCartResponse(.success):
                state.isAddingToCart = false
                return .run { _ in
                    await ToastManager.shared.show("Added to cart", type: .success)
                }

            case .addToCartResponse(.failure):
                state.isAddingToCart = false
                return .run { _ in
                    await ToastManager.shared.show("Failed to add to cart", type: .error)
                }

            case .buyNow:
                guard let sku = state.selectedSku else { return .none }
                state.isAddingToCart = true
                return .run { [skuId = sku.id] send in
                    let result = await Result {
                        try await cartClient.add(skuId, 1)
                        return VoidResult()
                    }
                    await send(.buyNowResponse(result))
                }

            case .buyNowResponse(.success):
                state.isAddingToCart = false
                state.buyNowComplete = true
                return .none

            case .buyNowResponse(.failure):
                state.isAddingToCart = false
                return .run { _ in
                    await ToastManager.shared.show("Failed to add to cart", type: .error)
                }
            }
        }
    }
}

/// Placeholder for void API responses
struct VoidResult: Decodable, Equatable, Sendable {}
