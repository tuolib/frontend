import Foundation
import ComposableArchitecture

struct PaginationState<Item: Equatable & Identifiable & Sendable>: Equatable, Sendable where Item.ID: Sendable {
    var items: IdentifiedArrayOf<Item> = []
    var page: Int = 1
    var totalPages: Int = 1
    var isLoading: Bool = false
    var isLoadingMore: Bool = false
    var hasMore: Bool { page < totalPages }
    var isEmpty: Bool { items.isEmpty && !isLoading }

    mutating func reset() {
        items = []
        page = 1
        totalPages = 1
        isLoading = false
        isLoadingMore = false
    }

    mutating func startLoading() {
        if page == 1 {
            isLoading = true
        } else {
            isLoadingMore = true
        }
    }

    mutating func appendPage(_ newItems: [Item], pagination: Pagination) {
        if pagination.page == 1 {
            items = IdentifiedArray(uniqueElements: newItems)
        } else {
            for item in newItems {
                items.append(item)
            }
        }
        page = pagination.page
        totalPages = pagination.totalPages
        isLoading = false
        isLoadingMore = false
    }

    mutating func handleError() {
        isLoading = false
        isLoadingMore = false
    }
}
