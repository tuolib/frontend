import SwiftUI

struct SkuSelector: View {
    let dimensions: [(key: String, values: [String])]
    let selectedAttributes: [String: String]
    let skus: [Sku]
    let onSelect: (String, String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingMD) {
            ForEach(dimensions, id: \.key) { dimension in
                VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
                    Text(dimension.key)
                        .font(ShopFonts.subheadlineSemibold)
                        .foregroundStyle(Color.shopText)

                    FlowLayout(spacing: ShopDimens.spacingSM) {
                        ForEach(dimension.values, id: \.self) { value in
                            let isSelected = selectedAttributes[dimension.key] == value
                            let isAvailable = isOptionAvailable(key: dimension.key, value: value)

                            Button {
                                onSelect(dimension.key, value)
                            } label: {
                                Text(value)
                                    .font(ShopFonts.subheadline)
                                    .foregroundStyle(
                                        !isAvailable ? Color.shopDivider :
                                        isSelected ? .white : Color.shopText
                                    )
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background(
                                        isSelected ? Color.shopPrimary :
                                        !isAvailable ? Color.shopBackground.opacity(0.5) :
                                        Color.shopBackground
                                    )
                                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: ShopDimens.radiusMD)
                                            .stroke(
                                                isSelected ? Color.shopPrimary : Color.shopDivider,
                                                lineWidth: 1
                                            )
                                    )
                            }
                            .buttonStyle(.plain)
                            .disabled(!isAvailable)
                        }
                    }
                }
            }
        }
    }

    /// Check if selecting this option would lead to at least one valid SKU with stock > 0
    private func isOptionAvailable(key: String, value: String) -> Bool {
        var testAttributes = selectedAttributes
        testAttributes[key] = value

        return skus.contains { sku in
            guard sku.stock > 0, sku.status == "active" else { return false }
            return testAttributes.allSatisfy { k, v in
                sku.attributes[k] == v
            }
        }
    }
}
