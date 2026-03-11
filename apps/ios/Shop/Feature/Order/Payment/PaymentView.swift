import SwiftUI
import ComposableArchitecture

struct PaymentView: View {
    @Bindable var store: StoreOf<PaymentFeature>
    var onViewOrder: (String) -> Void
    var onContinueShopping: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if store.paymentSuccess {
                paymentSuccessView
            } else if let order = store.order {
                paymentContent(order)
            } else if store.loadFailed {
                EmptyStateView(
                    icon: "exclamationmark.triangle",
                    title: "Failed to load order",
                    actionTitle: "Retry",
                    action: { store.send(.onAppear) }
                )
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(Color.shopBackground)
        .navigationTitle(store.paymentSuccess ? "" : "Payment")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden()
        .onAppear { store.send(.onAppear) }
    }

    // MARK: - Payment Success

    private var paymentSuccessView: some View {
        VStack(spacing: ShopDimens.spacingLG) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64))
                .foregroundStyle(Color.green)

            Text("Payment Successful")
                .font(ShopFonts.title3)
                .foregroundStyle(Color.shopText)

            Text("Your order has been confirmed")
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)

            VStack(spacing: ShopDimens.spacingMD) {
                Button {
                    onViewOrder(store.orderId)
                } label: {
                    Text("View Order")
                        .font(ShopFonts.subheadlineSemibold)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.shopTeal)
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
                }

                Button {
                    onContinueShopping()
                } label: {
                    Text("Continue Shopping")
                        .font(ShopFonts.subheadlineSemibold)
                        .foregroundStyle(Color.shopTeal)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.shopTeal.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
                }
            }
            .padding(.horizontal, 48)
            .padding(.top, ShopDimens.spacingMD)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func paymentContent(_ order: Order) -> some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: ShopDimens.spacingLG) {
                    // Amount
                    amountSection(order)

                    // Countdown
                    if let expireDate = store.expireDate, !store.isExpired {
                        countdownSection(expireDate)
                    } else if store.isExpired {
                        expiredBanner
                    }

                    // Payment methods
                    methodSection

                    // Order info
                    orderInfoSection(order)
                }
                .padding(.vertical, ShopDimens.spacingLG)
            }

            // Bottom bar
            bottomBar(order)
        }
    }

    // MARK: - Amount

    private func amountSection(_ order: Order) -> some View {
        VStack(spacing: ShopDimens.spacingSM) {
            Text("Amount to Pay")
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)

            PriceText(order.payAmountValue, size: .large)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, ShopDimens.spacingLG)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Countdown

    private func countdownSection(_ expireDate: Date) -> some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            let remaining = expireDate.timeIntervalSince(context.date)
            if remaining > 0 {
                HStack(spacing: ShopDimens.spacingSM) {
                    Image(systemName: "clock")
                        .foregroundStyle(Color.orange)
                    Text("Pay within")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                    Text(formatCountdown(remaining))
                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                        .foregroundStyle(Color.shopPrice)
                }
                .frame(maxWidth: .infinity)
                .padding(ShopDimens.spacingMD)
                .background(Color(hex: "#FFF8E1"))
                .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                .padding(.horizontal, ShopDimens.spacingMD)
            }
        }
    }

    private var expiredBanner: some View {
        HStack(spacing: ShopDimens.spacingSM) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(Color.red)
            Text("Order has expired")
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.red)
        }
        .frame(maxWidth: .infinity)
        .padding(ShopDimens.spacingMD)
        .background(Color.red.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Payment Methods

    private let methods: [(id: String, name: String, icon: String)] = [
        ("mock", "Mock Payment", "creditcard"),
        ("alipay", "Alipay", "dollarsign.circle"),
        ("wechat", "WeChat Pay", "message.circle"),
    ]

    private var methodSection: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            Text("Payment Method")
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(Color.shopText)
                .padding(.horizontal, ShopDimens.spacingMD)

            ForEach(methods, id: \.id) { method in
                Button {
                    store.send(.selectMethod(method.id))
                } label: {
                    HStack(spacing: ShopDimens.spacingMD) {
                        Image(systemName: method.icon)
                            .font(.title3)
                            .foregroundStyle(Color.shopTeal)
                            .frame(width: 32)

                        Text(method.name)
                            .font(ShopFonts.subheadline)
                            .foregroundStyle(Color.shopText)

                        Spacer()

                        Image(systemName: store.selectedMethod == method.id
                              ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(store.selectedMethod == method.id
                                             ? Color.shopTeal : Color.shopDivider)
                    }
                    .padding(ShopDimens.spacingMD)
                }
                .buttonStyle(.plain)

                if method.id != methods.last?.id {
                    Divider().padding(.leading, 56)
                }
            }
        }
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Order Info

    private func orderInfoSection(_ order: Order) -> some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            Text("Order Info")
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(Color.shopText)

            infoRow("Order No.", value: order.orderNo)
            infoRow("Items", value: "\(order.items.count)")
            infoRow("Total", value: "¥\(String(format: "%.2f", order.payAmountValue))")
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    private func infoRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(ShopFonts.caption)
                .foregroundStyle(Color.shopTextSecondary)
            Spacer()
            Text(value)
                .font(ShopFonts.caption)
                .foregroundStyle(Color.shopText)
        }
    }

    // MARK: - Bottom Bar

    private func bottomBar(_ order: Order) -> some View {
        Button {
            store.send(.payNow)
        } label: {
            HStack {
                if store.isPaying {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Pay Now  ¥\(String(format: "%.2f", order.payAmountValue))")
                }
            }
            .font(ShopFonts.subheadlineSemibold)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(store.isPaying || store.isExpired
                        ? Color.shopTextSecondary : Color.shopAccent)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
        }
        .disabled(store.isPaying || store.isExpired)
        .padding(.horizontal, ShopDimens.spacingMD)
        .padding(.vertical, ShopDimens.spacingSM)
        .background(Color.shopCard)
        .overlay(alignment: .top) { Divider() }
    }

    // MARK: - Helpers

    private func formatCountdown(_ seconds: TimeInterval) -> String {
        let h = Int(seconds) / 3600
        let m = (Int(seconds) % 3600) / 60
        let s = Int(seconds) % 60
        return String(format: "%02d:%02d:%02d", h, m, s)
    }
}
