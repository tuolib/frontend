import ComposableArchitecture

@DependencyClient
struct OrderClient: Sendable {
    var create: @Sendable (_ items: [OrderAPI.CreateRequest.CreateItem], _ addressId: String, _ remark: String?) async throws -> CreateOrderResult
    var list: @Sendable (_ page: Int, _ pageSize: Int, _ status: String?) async throws -> PaginatedResult<OrderSummary>
    var detail: @Sendable (_ orderId: String) async throws -> Order
    var cancel: @Sendable (_ orderId: String, _ reason: String?) async throws -> Void
}

extension OrderClient: DependencyKey {
    static let liveValue = OrderClient(
        create: { items, addressId, remark in
            try await OrderAPI.create(.init(items: items, addressId: addressId, remark: remark))
        },
        list: { page, pageSize, status in
            try await OrderAPI.list(.init(page: page, pageSize: pageSize, status: status))
        },
        detail: { orderId in
            try await OrderAPI.detail(.init(orderId: orderId))
        },
        cancel: { orderId, reason in
            try await OrderAPI.cancel(.init(orderId: orderId, reason: reason))
        }
    )
}

extension DependencyValues {
    var orderClient: OrderClient {
        get { self[OrderClient.self] }
        set { self[OrderClient.self] = newValue }
    }
}
