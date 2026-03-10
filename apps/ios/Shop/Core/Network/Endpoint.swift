import Foundation

enum Endpoint {
    // Auth
    case authLogin, authRegister, authRefresh, authLogout
    // User
    case userProfile, userUpdate
    // Address
    case addressList, addressCreate, addressUpdate, addressDelete
    // Product
    case productList, productDetail, productSearch
    // Category
    case categoryTree, categoryList
    // Banner
    case bannerList
    // Cart
    case cartList, cartAdd, cartUpdate, cartRemove, cartSelect, cartCheckoutPreview
    // Order
    case orderCreate, orderList, orderDetail, orderCancel
    // Payment
    case paymentCreate, paymentQuery

    var path: String {
        switch self {
        case .authLogin:           "/api/v1/auth/login"
        case .authRegister:        "/api/v1/auth/register"
        case .authRefresh:         "/api/v1/auth/refresh"
        case .authLogout:          "/api/v1/auth/logout"
        case .userProfile:         "/api/v1/user/profile"
        case .userUpdate:          "/api/v1/user/update"
        case .addressList:         "/api/v1/user/address/list"
        case .addressCreate:       "/api/v1/user/address/create"
        case .addressUpdate:       "/api/v1/user/address/update"
        case .addressDelete:       "/api/v1/user/address/delete"
        case .productList:         "/api/v1/product/list"
        case .productDetail:       "/api/v1/product/detail"
        case .productSearch:       "/api/v1/product/search"
        case .categoryTree:        "/api/v1/category/tree"
        case .categoryList:        "/api/v1/category/list"
        case .bannerList:          "/api/v1/banner/list"
        case .cartList:            "/api/v1/cart/list"
        case .cartAdd:             "/api/v1/cart/add"
        case .cartUpdate:          "/api/v1/cart/update"
        case .cartRemove:          "/api/v1/cart/remove"
        case .cartSelect:          "/api/v1/cart/select"
        case .cartCheckoutPreview: "/api/v1/cart/checkout/preview"
        case .orderCreate:         "/api/v1/order/create"
        case .orderList:           "/api/v1/order/list"
        case .orderDetail:         "/api/v1/order/detail"
        case .orderCancel:         "/api/v1/order/cancel"
        case .paymentCreate:       "/api/v1/payment/create"
        case .paymentQuery:        "/api/v1/payment/query"
        }
    }

    var requiresIdempotency: Bool {
        switch self {
        case .orderCreate, .paymentCreate: true
        default: false
        }
    }
}
