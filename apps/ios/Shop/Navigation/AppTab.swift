import SwiftUI

enum AppTab: String, CaseIterable {
    case home, profile, cart, menu

    var title: String {
        switch self {
        case .home: "Home"
        case .profile: "You"
        case .cart: "Cart"
        case .menu: "Menu"
        }
    }

    var icon: String {
        switch self {
        case .home: "house.fill"
        case .profile: "person.fill"
        case .cart: "cart.fill"
        case .menu: "line.3.horizontal"
        }
    }
}
