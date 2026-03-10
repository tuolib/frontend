import Foundation

struct APIError: Error, Equatable, LocalizedError, Sendable {
    let code: Int
    let errorCode: String?
    let message: String

    func `is`(_ expected: ErrorCode) -> Bool {
        errorCode == expected.rawValue
    }

    var errorDescription: String? { message }

    static let unauthorized = APIError(code: 401, errorCode: nil, message: "Unauthorized")
    static let networkError = APIError(code: -1, errorCode: nil, message: "Network error")
    static let decodingError = APIError(code: -2, errorCode: nil, message: "Data parsing error")
}
