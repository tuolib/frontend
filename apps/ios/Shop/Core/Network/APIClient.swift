import Foundation

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

        // 401 auto-refresh retry (once)
        if let httpResponse = response as? HTTPURLResponse,
           httpResponse.statusCode == 401, needsAuth {
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

        let (data, _) = try await session.data(for: urlRequest)
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

        // 401 auto-refresh retry (once)
        if let httpResponse = response as? HTTPURLResponse,
           httpResponse.statusCode == 401, needsAuth {
            try await authManager.refreshAccessToken()
            return try await requestVoid(endpoint, body: body, needsAuth: true)
        }

        let apiResponse = try JSONDecoder.shop.decode(APIResponse<AnyCodable>.self, from: data)

        guard apiResponse.success else {
            throw APIError(
                code: apiResponse.code,
                errorCode: apiResponse.meta?.code,
                message: apiResponse.message
            )
        }
    }

    // MARK: - Private

    private func buildRequest(_ endpoint: Endpoint, body: some Encodable) -> URLRequest {
        var urlRequest = URLRequest(url: baseURL.appending(path: endpoint.path))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try? JSONEncoder().encode(body)
        #if DEBUG
        logRequest(urlRequest)
        #endif
        return urlRequest
    }

    private func decodeResponse<T: Decodable>(_ data: Data) throws -> T {
        #if DEBUG
        logResponse(data)
        #endif
        let apiResponse = try JSONDecoder.shop.decode(APIResponse<T>.self, from: data)

        guard apiResponse.success, let result = apiResponse.data else {
            throw APIError(
                code: apiResponse.code,
                errorCode: apiResponse.meta?.code,
                message: apiResponse.message
            )
        }

        return result
    }

    // MARK: - Debug Logging

    #if DEBUG
    private func logRequest(_ request: URLRequest) {
        let url = request.url?.absoluteString ?? "?"
        let body = request.httpBody.flatMap { String(data: $0, encoding: .utf8) } ?? "{}"
        print("🌐 → POST \(url)")
        print("   Body: \(body)")
    }

    private func logResponse(_ data: Data) {
        let text = String(data: data, encoding: .utf8) ?? "?"
        let preview = text.count > 500 ? String(text.prefix(500)) + "..." : text
        print("🌐 ← \(preview)")
    }
    #endif
}
