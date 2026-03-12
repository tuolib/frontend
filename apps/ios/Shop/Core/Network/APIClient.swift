import Foundation
import OSLog

private let logger = Logger(subsystem: "com.example.shop", category: "API")
private let bodyLogger = Logger(subsystem: "com.example.shop", category: "API.Body")

struct EmptyBody: Encodable, Sendable {}

struct APIClient: Sendable {
    static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession
    private let authManager: AuthManager

    private static var defaultBaseURL: URL {
        #if DEBUG
        URL(string: "https://api.find345.site")!
        #else
        URL(string: "https://api.find345.site")!
        #endif
    }

    init(
        baseURL: URL = APIClient.defaultBaseURL,
        session: URLSession = .shared,
        authManager: AuthManager = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
        self.authManager = authManager
    }

    /// Authenticated request with automatic 401 refresh retry (once)
    func request<T: Decodable & Sendable>(
        _ endpoint: Endpoint,
        body: some Encodable & Sendable = EmptyBody(),
        needsAuth: Bool = false
    ) async throws -> T {
        var urlRequest = buildRequest(endpoint, body: body)

        if needsAuth {
            let token = try await authManager.validAccessToken()
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if endpoint.requiresIdempotency {
            urlRequest.setValue(
                IdempotencyKey.generate(),
                forHTTPHeaderField: "X-Idempotency-Key"
            )
        }

        let (data, response) = try await session.data(for: urlRequest)
        logResponse(endpoint, response: response, data: data)

        // 401 auto-refresh retry (once)
        if let httpResponse = response as? HTTPURLResponse,
           httpResponse.statusCode == 401, needsAuth {
            logger.info("↻ 401 retrying after token refresh: \(endpoint.path)")
            try await authManager.refreshAccessToken()
            return try await rawRequest(endpoint, body: body, needsAuth: true)
        }

        return try decodeResponse(data)
    }

    /// Raw request — no 401 retry, used by AuthManager.refresh to avoid infinite loop
    func rawRequest<T: Decodable & Sendable>(
        _ endpoint: Endpoint,
        body: some Encodable & Sendable = EmptyBody(),
        needsAuth: Bool = false
    ) async throws -> T {
        var urlRequest = buildRequest(endpoint, body: body)

        if needsAuth {
            let token = try await authManager.validAccessToken()
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: urlRequest)
        logResponse(endpoint, response: response, data: data)
        return try decodeResponse(data)
    }

    /// Request for endpoints that return `data: null` (e.g. logout)
    func requestVoid(
        _ endpoint: Endpoint,
        body: some Encodable & Sendable = EmptyBody(),
        needsAuth: Bool = false
    ) async throws {
        var urlRequest = buildRequest(endpoint, body: body)

        if needsAuth {
            let token = try await authManager.validAccessToken()
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if endpoint.requiresIdempotency {
            urlRequest.setValue(
                IdempotencyKey.generate(),
                forHTTPHeaderField: "X-Idempotency-Key"
            )
        }

        let (data, response) = try await session.data(for: urlRequest)
        logResponse(endpoint, response: response, data: data)

        // 401 auto-refresh retry (once) — use rawRequestVoid to avoid infinite loop
        if let httpResponse = response as? HTTPURLResponse,
           httpResponse.statusCode == 401, needsAuth {
            logger.info("↻ 401 retrying after token refresh: \(endpoint.path)")
            try await authManager.refreshAccessToken()
            return try await rawRequestVoid(endpoint, body: body, needsAuth: true)
        }

        try decodeVoidResponse(data)
    }

    /// Raw void request — no 401 retry, used after token refresh
    func rawRequestVoid(
        _ endpoint: Endpoint,
        body: some Encodable & Sendable = EmptyBody(),
        needsAuth: Bool = false
    ) async throws {
        var urlRequest = buildRequest(endpoint, body: body)

        if needsAuth {
            let token = try await authManager.validAccessToken()
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: urlRequest)
        logResponse(endpoint, response: response, data: data)
        try decodeVoidResponse(data)
    }

    // MARK: - Private

    private func buildRequest(_ endpoint: Endpoint, body: some Encodable) -> URLRequest {
        var urlRequest = URLRequest(url: baseURL.appending(path: endpoint.path))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try? JSONEncoder().encode(body)
        logRequest(endpoint, urlRequest: urlRequest)
        return urlRequest
    }

    private func decodeVoidResponse(_ data: Data) throws {
        let apiResponse = try JSONDecoder.shop.decode(APIResponse<AnyCodable>.self, from: data)

        guard apiResponse.success else {
            throw APIError(
                code: apiResponse.code,
                errorCode: apiResponse.meta?.code,
                message: apiResponse.message
            )
        }
    }

    private func decodeResponse<T: Decodable>(_ data: Data) throws -> T {
        let apiResponse: APIResponse<T>
        do {
            apiResponse = try JSONDecoder.shop.decode(APIResponse<T>.self, from: data)
        } catch {
            logger.error("✘ Decode error for \(T.self): \(error)")
            throw error
        }

        guard apiResponse.success, let result = apiResponse.data else {
            let error = APIError(
                code: apiResponse.code,
                errorCode: apiResponse.meta?.code,
                message: apiResponse.message
            )
            logger.error("✘ API error: \(error.message ?? "unknown") (code: \(apiResponse.code))")
            throw error
        }

        return result
    }

    // MARK: - OSLog

    private func logRequest(_ endpoint: Endpoint, urlRequest: URLRequest) {
        logger.info("→ POST \(endpoint.path)")
        if let data = urlRequest.httpBody, !data.isEmpty {
            let body = String(data: data, encoding: .utf8) ?? "{}"
            bodyLogger.debug("  ⬆ \(endpoint.path) \(body)")
        }
    }

    private func logResponse(_ endpoint: Endpoint, response: URLResponse, data: Data) {
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        let size = data.count
        if status >= 400 {
            logger.error("← \(status) \(endpoint.path) (\(size)B)")
        } else {
            logger.info("← \(status) \(endpoint.path) (\(size)B)")
        }
        // Response body logged separately via API.Body category — filter in Xcode console
        let text = String(data: data.prefix(1024), encoding: .utf8) ?? "?"
        bodyLogger.debug("  ⬇ \(endpoint.path) \(text)")
    }
}
