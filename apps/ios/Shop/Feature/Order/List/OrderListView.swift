import SwiftUI
import ComposableArchitecture
import Kingfisher

struct OrderListView: View {
    @Bindable var store: StoreOf<OrderListFeature>
    var onOrderTap: (String) -> Void
    var onPayment: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Tab bar
            scrollableTabBar

            // Order list
            orderList
        }
        .background(Color.shopBackground)
        .navigationTitle("My Orders")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { store.send(.onAppear) }
    }

    // MARK: - Tab Bar

    private var scrollableTabBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: ShopDimens.spacingSM) {
                ForEach(OrderStatus.allCases, id: \.self) { status in
                    Button {
                        store.send(.selectTab(status))
                    } label: {
                        Text(status.title)
                            .font(store.selectedTab == status
                                  ? ShopFonts.captionSemibold : ShopFonts.caption)
                            .foregroundStyle(store.selectedTab == status
                                             ? Color.shopTeal : Color.shopTextSecondary)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                store.selectedTab == status
                                ? Color.shopTeal.opacity(0.1) : Color.clear
                            )
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, ShopDimens.spacingMD)
            .padding(.vertical, ShopDimens.spacingSM)
        }
        .background(Color.shopCard)
        .overlay(alignment: .bottom) { Divider() }
    }

    // MARK: - Order List

    private var orderList: some View {
        Group {
            if store.pagination.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if store.pagination.isEmpty {
                EmptyStateView(
                    icon: "bag",
                    title: "No orders yet"
                )
            } else {
                ScrollView {
                    LazyVStack(spacing: ShopDimens.spacingMD) {
                        ForEach(store.pagination.items) { order in
                            orderCard(order)
                                .onAppear {
                                    if order.id == store.pagination.items.last?.id {
                                        store.send(.loadMore)
                                    }
                                }
                        }

                        if store.pagination.isLoadingMore {
                            ProgressView()
                                .tint(Color.shopTeal)
                                .frame(maxWidth: .infinity)
                                .padding()
                        }
                    }
                    .padding(ShopDimens.spacingMD)
                }
                .refreshable {
                    store.send(.refresh)
                }
            }
        }
    }

    // MARK: - Order Card

    private func orderCard(_ order: Order) -> some View {
        Button {
            onOrderTap(order.id)
        } label: {
            VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
                // Header
                HStack {
                    Text("#\(order.orderNo)")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                    Spacer()
                    Text(order.orderStatus.title)
                        .font(ShopFonts.captionSemibold)
                        .foregroundStyle(order.orderStatus.color)
                }

                Divider()

                // Items preview (first 2)
                ForEach(order.items.prefix(2)) { item in
                    HStack(spacing: ShopDimens.spacingSM) {
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
                            .frame(width: 56, height: 56)
                            .clipped()
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))

                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.productTitle)
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopText)
                                .lineLimit(1)

                            HStack {
                                PriceText(item.price, size: .small)
                                Text("x\(item.quantity)")
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopTextSecondary)
                            }
                        }

                        Spacer()
                    }
                }

                if order.items.count > 2 {
                    Text("\(order.items.count) items in total")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                }

                Divider()

                // Footer
                HStack {
                    Text("Total: ")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                    PriceText(order.payAmount, size: .small)

                    Spacer()

                    // Action buttons
                    if order.orderStatus == .pending {
                        Button {
                            store.send(.cancelOrder(order.id))
                        } label: {
                            Text("Cancel")
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopTextSecondary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .overlay(
                                    RoundedRectangle(cornerRadius: ShopDimens.radiusFull)
                                        .stroke(Color.shopDivider, lineWidth: 1)
                                )
                        }

                        Button {
                            onPayment(order.id)
                        } label: {
                            Text("Pay Now")
                                .font(ShopFonts.captionSemibold)
                                .foregroundStyle(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.shopAccent)
                                .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
                        }
                    }
                }
            }
            .padding(ShopDimens.spacingMD)
            .background(Color.shopCard)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        }
        .buttonStyle(.plain)
    }
}
