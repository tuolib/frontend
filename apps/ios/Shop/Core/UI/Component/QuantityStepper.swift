import SwiftUI

struct QuantityStepper: View {
    let quantity: Int
    let min: Int
    let max: Int
    let onChange: (Int) -> Void

    init(quantity: Int, min: Int = 1, max: Int = 99, onChange: @escaping (Int) -> Void) {
        self.quantity = quantity
        self.min = min
        self.max = max
        self.onChange = onChange
    }

    var body: some View {
        HStack(spacing: 0) {
            Button {
                if quantity > min {
                    onChange(quantity - 1)
                }
            } label: {
                Image(systemName: "minus")
                    .font(.system(size: 12, weight: .bold))
                    .frame(width: 28, height: 28)
                    .foregroundStyle(quantity <= min ? Color.shopDivider : Color.shopText)
            }
            .disabled(quantity <= min)

            Text("\(quantity)")
                .font(ShopFonts.subheadlineSemibold)
                .frame(minWidth: 32)
                .foregroundStyle(Color.shopText)

            Button {
                if quantity < max {
                    onChange(quantity + 1)
                }
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 12, weight: .bold))
                    .frame(width: 28, height: 28)
                    .foregroundStyle(quantity >= max ? Color.shopDivider : Color.shopText)
            }
            .disabled(quantity >= max)
        }
        .background(Color.shopBackground)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
    }
}

#Preview {
    VStack(spacing: 16) {
        QuantityStepper(quantity: 1, onChange: { _ in })
        QuantityStepper(quantity: 5, onChange: { _ in })
        QuantityStepper(quantity: 99, onChange: { _ in })
    }
    .padding()
}
