import Foundation

enum ErrorCode: String, Sendable {
    // User
    case userNotFound = "USER_NOT_FOUND"
    case emailAlreadyExists = "EMAIL_ALREADY_EXISTS"
    case invalidCredentials = "INVALID_CREDENTIALS"

    // Product
    case productNotFound = "PRODUCT_NOT_FOUND"
    case skuNotFound = "SKU_NOT_FOUND"
    case stockInsufficient = "STOCK_INSUFFICIENT"

    // Cart
    case cartItemNotFound = "CART_ITEM_NOT_FOUND"
    case cartExceedLimit = "CART_EXCEED_LIMIT"

    // Order
    case orderNotFound = "ORDER_NOT_FOUND"
    case orderCannotCancel = "ORDER_CANNOT_CANCEL"
    case orderExpired = "ORDER_EXPIRED"

    // Payment
    case paymentAlreadyPaid = "PAYMENT_ALREADY_PAID"

    // Address
    case addressNotFound = "ADDRESS_NOT_FOUND"

    // Token
    case tokenExpired = "TOKEN_EXPIRED"
    case tokenInvalid = "TOKEN_INVALID"
}
