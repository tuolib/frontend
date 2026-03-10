import ComposableArchitecture

// MARK: - APIClient Dependency

extension APIClient: DependencyKey {
    static let liveValue = APIClient.shared
}

extension DependencyValues {
    var apiClient: APIClient {
        get { self[APIClient.self] }
        set { self[APIClient.self] = newValue }
    }
}

// MARK: - AuthManager Dependency

extension AuthManager: DependencyKey {
    static let liveValue = AuthManager.shared
}

extension DependencyValues {
    var authManager: AuthManager {
        get { self[AuthManager.self] }
        set { self[AuthManager.self] = newValue }
    }
}

// MARK: - KeychainStore Dependency

extension KeychainStore: DependencyKey {
    static let liveValue = KeychainStore.shared
}

extension DependencyValues {
    var keychainStore: KeychainStore {
        get { self[KeychainStore.self] }
        set { self[KeychainStore.self] = newValue }
    }
}

// MARK: - SearchHistoryStore Dependency

extension SearchHistoryStore: DependencyKey {
    static let liveValue = SearchHistoryStore.shared
}

extension DependencyValues {
    var searchHistoryStore: SearchHistoryStore {
        get { self[SearchHistoryStore.self] }
        set { self[SearchHistoryStore.self] = newValue }
    }
}
