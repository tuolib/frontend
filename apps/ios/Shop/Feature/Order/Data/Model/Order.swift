import Foundation

/// Minimal result from order/create
struct CreateOrderResult: Codable, Equatable, Sendable {
    let orderId: String
    let orderNo: String
    let payAmount: String
    let expiresAt: String

    var payAmountValue: Double {
        Double(payAmount) ?? 0
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        orderId = try container.decode(String.self, forKey: .orderId)
        orderNo = try container.decode(String.self, forKey: .orderNo)
        payAmount = try container.decodePrice(forKey: .payAmount)
        expiresAt = try container.decode(String.self, forKey: .expiresAt)
    }
}

/// Full order — returned by order/detail
struct Order: Codable, Equatable, Identifiable, Sendable {
    let orderId: String
    let orderNo: String
    let status: String
    let totalAmount: String
    let discountAmount: String?
    let payAmount: String
    let remark: String?
    let expiresAt: String?
    let paidAt: String?
    let shippedAt: String?
    let deliveredAt: String?
    let completedAt: String?
    let cancelledAt: String?
    let cancelReason: String?
    let createdAt: String
    let items: [OrderItem]
    let address: OrderAddress?

    var id: String { orderId }

    var orderStatus: OrderStatus {
        OrderStatus(rawValue: status) ?? .pending
    }

    var totalAmountValue: Double {
        Double(totalAmount) ?? 0
    }

    var payAmountValue: Double {
        Double(payAmount) ?? 0
    }

    var discountAmountValue: Double {
        Double(discountAmount ?? "0") ?? 0
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        orderId = try container.decode(String.self, forKey: .orderId)
        orderNo = try container.decode(String.self, forKey: .orderNo)
        status = try container.decode(String.self, forKey: .status)
        totalAmount = try container.decodePrice(forKey: .totalAmount)
        discountAmount = try container.decodePriceIfPresent(forKey: .discountAmount)
        payAmount = try container.decodePrice(forKey: .payAmount)
        remark = try container.decodeIfPresent(String.self, forKey: .remark)
        expiresAt = try container.decodeIfPresent(String.self, forKey: .expiresAt)
        paidAt = try container.decodeIfPresent(String.self, forKey: .paidAt)
        shippedAt = try container.decodeIfPresent(String.self, forKey: .shippedAt)
        deliveredAt = try container.decodeIfPresent(String.self, forKey: .deliveredAt)
        completedAt = try container.decodeIfPresent(String.self, forKey: .completedAt)
        cancelledAt = try container.decodeIfPresent(String.self, forKey: .cancelledAt)
        cancelReason = try container.decodeIfPresent(String.self, forKey: .cancelReason)
        createdAt = try container.decode(String.self, forKey: .createdAt)
        items = try container.decode([OrderItem].self, forKey: .items)
        address = try container.decodeIfPresent(OrderAddress.self, forKey: .address)
    }
}

/// Simplified order — returned by order/list
struct OrderSummary: Codable, Equatable, Identifiable, Sendable {
    let orderId: String
    let orderNo: String
    let status: String
    let payAmount: String
    let itemCount: Int
    let firstItem: OrderFirstItem?
    let createdAt: String

    var id: String { orderId }

    var orderStatus: OrderStatus {
        OrderStatus(rawValue: status) ?? .pending
    }

    var payAmountValue: Double {
        Double(payAmount) ?? 0
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        orderId = try container.decode(String.self, forKey: .orderId)
        orderNo = try container.decode(String.self, forKey: .orderNo)
        status = try container.decode(String.self, forKey: .status)
        payAmount = try container.decodePrice(forKey: .payAmount)
        itemCount = try container.decode(Int.self, forKey: .itemCount)
        firstItem = try container.decodeIfPresent(OrderFirstItem.self, forKey: .firstItem)
        createdAt = try container.decode(String.self, forKey: .createdAt)
    }
}

struct OrderFirstItem: Codable, Equatable, Sendable {
    let productTitle: String
    let imageUrl: String?
    let skuAttrs: [String: String]?

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        productTitle = try container.decode(String.self, forKey: .productTitle)
        imageUrl = try container.decodeIfPresent(String.self, forKey: .imageUrl)
        // skuAttrs typed as `unknown` in backend — silently fall back to nil
        skuAttrs = try? container.decodeIfPresent([String: String].self, forKey: .skuAttrs)
    }
}
