import SwiftUI

enum OrderStatus: String, CaseIterable, Sendable {
    case all = ""
    case pending, paid, shipped, delivered, completed, cancelled, refunded

    var title: String {
        switch self {
        case .all: "All"
        case .pending: "Pending"
        case .paid: "Paid"
        case .shipped: "Shipped"
        case .delivered: "Delivered"
        case .completed: "Completed"
        case .cancelled: "Cancelled"
        case .refunded: "Refunded"
        }
    }

    var icon: String {
        switch self {
        case .all: "list.bullet"
        case .pending: "clock"
        case .paid: "creditcard"
        case .shipped: "shippingbox"
        case .delivered: "house"
        case .completed: "checkmark.circle"
        case .cancelled: "xmark.circle"
        case .refunded: "arrow.uturn.left.circle"
        }
    }

    var color: Color {
        switch self {
        case .all: .shopText
        case .pending: .orange
        case .paid: .shopTeal
        case .shipped: .blue
        case .delivered: .purple
        case .completed: .green
        case .cancelled: .shopTextSecondary
        case .refunded: .red
        }
    }
}
