import Foundation

enum HomeAPI {
    static func banners() async throws -> [Banner] {
        try await APIClient.shared.request(.bannerList)
    }
}
