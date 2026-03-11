import SwiftUI

enum AppRoute: Hashable {
    case productList(categoryId: String?, categoryName: String?)
    case productDetail(id: String)
    case search
    case orderCreate
    case orderList
    case orderDetail(id: String)
    case payment(orderId: String)
    case addressManage
    case login
    case register
}
