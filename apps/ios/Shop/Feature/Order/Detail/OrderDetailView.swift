import SwiftUI
import ComposableArchitecture
import Kingfisher

struct OrderDetailView: View {
    @Bindable var store: StoreOf<OrderDetailFeature>
    var onPayment: (String) -> Void
    var onProductTap: (String) -> Void

    var body: some View {
        Group {
            if store.isLoading && store.order == nil {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let order = store.order {
                orderContent(order)
            } else {
                EmptyStateView(
                    icon: "exclamationmark.triangle",
                    title: "Failed to load order",
                    actionTitle: "Retry",
                    action: { store.send(.onAppear) }
                )
            }
        }
        .background(Color.shopBackground)
        .navigationTitle("Order Detail")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { store.send(.onAppear) }
        .confirmationDialog(
            "Cancel Order",
            isPresented: Binding(
                get: { store.showCancelDialog },
                set: { newValue in
                    if !newValue { store.send(.dismissCancelConfirmation) }
                }
            ),
            titleVisibility: .visible
        ) {
            Button("Cancel Order", role: .destructive) {
                store.send(.confirmCancel)
            }
            Button("Keep Order", role: .cancel) {}
        } message: {
            Text("Are you sure you want to cancel this order? This action cannot be undone.")
        }
    }

    private func orderContent(_ order: Order) -> some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: ShopDimens.spacingMD) {
                    // Status banner
                    statusBanner(order)

                    // Address
                    if let address = order.address {
                        addressSection(address)
                    }

                    // Items
                    itemsSection(order.items)

                    // Price breakdown
                    priceSection(order)

                    // Order info
                    orderInfoSection(order)
                }
                .padding(.vertical, ShopDimens.spacingMD)
            }
            .refreshable { store.send(.refresh) }

            // Bottom actions
            if order.orderStatus == .pending || order.orderStatus == .paid {
                actionBar(order)
            }
        }
    }

    // MARK: - Status Banner

    private func statusBanner(_ order: Order) -> some View {
        HStack(spacing: ShopDimens.spacingMD) {
            Image(systemName: order.orderStatus.icon)
                .font(.title2)
                .foregroundStyle(.white)

            VStack(alignment: .leading, spacing: 2) {
                Text(order.orderStatus.title)
                    .font(ShopFonts.title3)
                    .foregroundStyle(.white)

                if order.orderStatus == .pending {
                    Text("Awaiting payment")
                        .font(ShopFonts.caption)
                        .foregroundStyle(.white.opacity(0.8))
                } else if order.orderStatus == .shipped {
                    Text("On the way")
                        .font(ShopFonts.caption)
                        .foregroundStyle(.white.opacity(0.8))
                }
            }

            Spacer()
        }
        .padding(ShopDimens.spacingLG)
        .background(
            LinearGradient(
                colors: [order.orderStatus.color, order.orderStatus.color.opacity(0.7)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Address

    private func addressSection(_ address: OrderAddress) -> some View {
        HStack(spacing: ShopDimens.spacingMD) {
            Image(systemName: "mappin.circle.fill")
                .font(.title3)
                .foregroundStyle(Color.shopTeal)

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(address.recipient)
                        .font(ShopFonts.subheadlineSemibold)
                        .foregroundStyle(Color.shopText)
                    Text(address.phone)
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                }
                Text(address.fullAddress)
                    .font(ShopFonts.caption)
                    .foregroundStyle(Color.shopTextSecondary)
                    .lineLimit(2)
            }

            Spacer()
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Items

    private func itemsSection(_ items: [OrderItem]) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Items")
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(Color.shopText)
                .padding(.horizontal, ShopDimens.spacingMD)
                .padding(.top, ShopDimens.spacingMD)
                .padding(.bottom, ShopDimens.spacingSM)

            ForEach(items) { item in
                Button {
                    onProductTap(item.productId)
                } label: {
                    HStack(spacing: ShopDimens.spacingMD) {
                        KFImage(URL(string: item.imageUrl ?? ""))
                            .placeholder {
                                Color.shopBackground
                                    .overlay {
                                        Image(systemName: "photo")
                                            .foregroundStyle(Color.shopDivider)
                                    }
                            }
                            .resizable()
                            .scaledToFill()
                            .frame(width: 64, height: 64)
                            .clipped()
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))

                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.productTitle)
                                .font(ShopFonts.subheadline)
                                .foregroundStyle(Color.shopText)
                                .lineLimit(2)

                            if let attrs = item.skuAttrs, !attrs.isEmpty {
                                Text(attrs.map { "\($0.key): \($0.value)" }.joined(separator: ", "))
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopTextSecondary)
                            }

                            HStack {
                                PriceText(item.unitPriceValue, size: .small)
                                Spacer()
                                Text("x\(item.quantity)")
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopTextSecondary)
                            }
                        }
                    }
                    .padding(.horizontal, ShopDimens.spacingMD)
                    .padding(.vertical, ShopDimens.spacingSM)
                }
                .buttonStyle(.plain)

                if item.id != items.last?.id {
                    Divider().padding(.leading, 96)
                }
            }
        }
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Price

    private func priceSection(_ order: Order) -> some View {
        VStack(spacing: ShopDimens.spacingSM) {
            priceRow("Subtotal", value: order.totalAmountValue)
            if order.discountAmountValue > 0 {
                priceRow("Discount", value: -order.discountAmountValue)
            }
            priceRow("Shipping", valueText: "Free")
            Divider()
            HStack {
                Text("Total")
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(Color.shopText)
                Spacer()
                PriceText(order.payAmountValue, size: .normal)
            }
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    private func priceRow(_ label: String, value: Double) -> some View {
        HStack {
            Text(label)
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)
            Spacer()
            Text("¥\(String(format: "%.2f", value))")
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopText)
        }
    }

    private func priceRow(_ label: String, valueText: String) -> some View {
        HStack {
            Text(label)
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)
            Spacer()
            Text(valueText)
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.green)
        }
    }

    // MARK: - Order Info

    private func orderInfoSection(_ order: Order) -> some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            Text("Order Information")
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(Color.shopText)

            infoRow("Order No.", value: order.orderNo)
            infoRow("Created", value: formatDate(order.createdAt))
            if let remark = order.remark, !remark.isEmpty {
                infoRow("Remark", value: remark)
            }
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    private func infoRow(_ label: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text(label)
                .font(ShopFonts.caption)
                .foregroundStyle(Color.shopTextSecondary)
                .frame(width: 80, alignment: .leading)
            Text(value)
                .font(ShopFonts.caption)
                .foregroundStyle(Color.shopText)
            Spacer()
        }
    }

    // MARK: - Action Bar

    private func actionBar(_ order: Order) -> some View {
        HStack(spacing: ShopDimens.spacingMD) {
            if order.orderStatus == .pending || order.orderStatus == .paid {
                Button {
                    store.send(.showCancelConfirmation)
                } label: {
                    Text("Cancel Order")
                        .font(ShopFonts.subheadline)
                        .foregroundStyle(Color.shopTextSecondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .overlay(
                            RoundedRectangle(cornerRadius: ShopDimens.radiusFull)
                                .stroke(Color.shopDivider, lineWidth: 1)
                        )
                }
            }

            if order.orderStatus == .pending {
                Button {
                    onPayment(order.id)
                } label: {
                    Text("Pay Now")
                        .font(ShopFonts.subheadlineSemibold)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.shopAccent)
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
                }
            }
        }
        .padding(.horizontal, ShopDimens.spacingMD)
        .padding(.vertical, ShopDimens.spacingSM)
        .background(Color.shopCard)
        .overlay(alignment: .top) { Divider() }
    }

    // MARK: - Helpers

    private func formatDate(_ isoString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        guard let date = isoFormatter.date(from: isoString) else { return isoString }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        return formatter.string(from: date)
    }
}
