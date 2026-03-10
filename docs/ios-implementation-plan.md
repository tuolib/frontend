# iOS 原生实现计划（Amazon 级架构）

> 对标 H5 商城全部功能，使用现代 iOS 技术栈，Amazon 级别架构标准。
> 7 个 Phase 对齐 Android 项目结构，经过架构优化。

---

## 技术栈

| 层级 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 语言 | Swift | 6.0+ | 100% Swift，零 ObjC |
| 最低系统 | iOS 17.0 | — | 覆盖 90%+ 设备，解锁最新 API |
| UI | SwiftUI | — | 声明式 UI，对标 Compose / React |
| 架构 | TCA (The Composable Architecture) | 1.x | 单向数据流，对标 Zustand / MVI |
| 导航 | NavigationStack | — | 原生类型安全路由 |
| 网络 | URLSession + async/await | — | 原生异步，无需第三方 |
| 序列化 | Codable | — | 编译期 JSON 解析 |
| 异步 | Swift Concurrency | — | async/await + Actor |
| DI | TCA `@DependencyClient` | — | 宏自动生成 DependencyKey，极简 |
| 图片 | Kingfisher 8 | 8.x | SwiftUI 原生支持 + 缓存 |
| 本地存储 | Keychain + UserDefaults | — | Token 存 Keychain，偏好存 UserDefaults |
| 包管理 | Swift Package Manager | — | Apple 官方，零配置 |

---

## 为什么选 TCA 而不是 MVVM？

| | MVVM | TCA (推荐) |
|--|------|-----------|
| 数据流 | 双向绑定，`@Published` 分散 | **单向数据流**，与 Zustand/MVI 一致 |
| 状态管理 | 每个 ViewModel 自成一套 | **统一 State + Action + Reducer** |
| 副作用 | 散落在 ViewModel 各处 | **Effect 统一管理**，可测试 |
| 组合性 | ViewModel 难以组合 | **Scope/子 Reducer 自由组合** |
| 测试性 | 需 Mock 大量依赖 | **TestStore 内置**，断言确定性 |
| 与 H5 对应 | 不太匹配 | **Store/Action 与 Zustand 几乎 1:1** |

> TCA 是 iOS 社区最流行的架构库（20k+ GitHub Stars），由 Point-Free 维护。

---

## 设计 Token（与 H5 / Android 保持一致）

```
主色（深色背景）：   #131921
强调色（按钮/CTA）：  #FF9900
强调色 pressed：     #E68A00
价格色：            #B12704
Teal（链接/选中）：   #007185
成功色：            #067D62
背景灰：            #EAEDED
卡片白：            #FFFFFF
文字主色：           #0F1111
文字次色：           #565959
分割线：            #DDDDDD
星标色：            #FFA41C
```

---

## 项目目录结构

```
apps/ios/
├── Shop.xcodeproj                            # Xcode 项目
├── Package.swift                             # SPM 依赖管理
│
└── Shop/
    ├── ShopApp.swift                         # @main App 入口
    ├── ContentView.swift                     # 根视图（TabView + NavigationStack）
    │
    ├── Core/                                 # ════════ 核心基础层 ════════
    │   │
    │   ├── Network/
    │   │   ├── APIClient.swift               # struct Sendable，并发安全，非 actor
    │   │   ├── APIError.swift                # 统一异常，对标 @fe/api-client ApiError
    │   │   ├── APIResponse.swift             # { code, success, data, message, traceId }
    │   │   ├── AuthManager.swift             # actor：Token 注入 + coalesced 刷新 + 防循环
    │   │   ├── Endpoint.swift                # 路由定义（POST /api/v1/...）
    │   │   └── IdempotencyKey.swift          # UUID 幂等 key 生成
    │   │
    │   ├── Storage/
    │   │   ├── KeychainStore.swift           # Keychain 加密存储 token + 过期时间
    │   │   ├── SearchHistoryStore.swift      # UserDefaults 搜索历史
    │   │   └── AppStorage+Extensions.swift   # @AppStorage 扩展
    │   │
    │   ├── Model/
    │   │   ├── PaginatedResult.swift         # 分页响应 Codable
    │   │   ├── PaginationState.swift         # 泛型分页状态（复用于列表/搜索/订单）
    │   │   └── ErrorCode.swift               # 业务错误码常量
    │   │
    │   ├── UI/
    │   │   ├── Theme/
    │   │   │   ├── ShopColors.swift          # Color 扩展，Amazon 色系
    │   │   │   ├── ShopFonts.swift           # 字体系统
    │   │   │   └── ShopDimens.swift          # 间距/圆角/尺寸规范
    │   │   │
    │   │   └── Component/                    # 跨 Feature 复用组件
    │   │       ├── ProductCard.swift         # 商品卡片
    │   │       ├── ProductGrid.swift         # 2 列网格 + 无限滚动
    │   │       ├── SortBar.swift             # 排序切换栏
    │   │       ├── PriceText.swift           # 价格显示（双类型：String + Double）
    │   │       ├── QuantityStepper.swift     # 数量 +/- 步进器
    │   │       ├── RatingStars.swift         # 星级评分
    │   │       ├── SkeletonView.swift        # 骨架屏
    │   │       ├── EmptyStateView.swift      # 空状态
    │   │       ├── LoadingButton.swift       # 带 loading 的按钮
    │   │       └── ToastView.swift           # Toast 提示（全局覆盖层）
    │   │
    │   ├── Util/
    │   │   ├── PriceFormatter.swift          # 双类型金额格式化（String + Double）
    │   │   ├── DateFormatter+Shop.swift      # 日期格式化
    │   │   └── View+Extensions.swift         # View 扩展
    │   │
    │   └── DI/
    │       └── Dependencies.swift            # @DependencyClient 注册
    │
    ├── Navigation/                           # ════════ 全局导航 ════════
    │   ├── AppTab.swift                      # Tab 枚举定义
    │   ├── AppRouter.swift                   # 路由路径定义
    │   └── MainTabView.swift                 # TabView + 各 Tab 的 NavigationStack
    │
    └── Feature/                              # ════════ 业务功能层 ════════
        │
        ├── Home/                             # 首页
        │   ├── HomeView.swift
        │   ├── HomeFeature.swift             # TCA Reducer，async let 并行加载
        │   ├── Component/
        │   │   ├── BannerCarousel.swift       # TabView 自动轮播
        │   │   ├── CategoryPills.swift        # 横滑分类胶囊
        │   │   ├── DealSection.swift          # Deal of the Day
        │   │   ├── CategoryShowcase.swift     # 分类展示
        │   │   ├── NewArrivalsSection.swift   # 新品区
        │   │   └── TopRatedSection.swift      # 好评区
        │   └── Data/
        │       ├── HomeAPI.swift
        │       └── HomeClient.swift           # @DependencyClient
        │
        ├── Product/                          # 商品
        │   ├── List/
        │   │   ├── ProductListView.swift
        │   │   └── ProductListFeature.swift   # 使用 PaginationState<Product>
        │   ├── Detail/
        │   │   ├── ProductDetailView.swift
        │   │   ├── ProductDetailFeature.swift
        │   │   └── Component/
        │   │       ├── ImageCarousel.swift     # TabView 图片轮播
        │   │       └── SkuSelector.swift       # SKU 属性选择
        │   ├── Search/
        │   │   ├── SearchView.swift
        │   │   └── SearchFeature.swift        # 使用 PaginationState<Product>
        │   └── Data/
        │       ├── ProductAPI.swift
        │       ├── ProductClient.swift        # @DependencyClient
        │       └── Model/
        │           ├── Product.swift
        │           ├── ProductDetail.swift
        │           ├── Sku.swift
        │           └── SearchResult.swift
        │
        ├── Menu/                             # 分类菜单
        │   ├── MenuView.swift
        │   ├── MenuFeature.swift
        │   └── Data/
        │       ├── CategoryAPI.swift
        │       ├── CategoryClient.swift       # @DependencyClient
        │       └── Model/
        │           └── Category.swift
        │
        ├── Cart/                             # 购物车
        │   ├── CartView.swift
        │   ├── CartFeature.swift             # 乐观更新 + 300ms 防抖
        │   └── Data/
        │       ├── CartAPI.swift
        │       ├── CartClient.swift           # @DependencyClient
        │       └── Model/
        │           ├── CartItem.swift         # price: Double（非 String）
        │           └── CheckoutPreview.swift
        │
        ├── Order/                            # 订单
        │   ├── Create/
        │   │   ├── OrderCreateView.swift
        │   │   └── OrderCreateFeature.swift
        │   ├── List/
        │   │   ├── OrderListView.swift
        │   │   └── OrderListFeature.swift     # 使用 PaginationState<Order>
        │   ├── Detail/
        │   │   ├── OrderDetailView.swift
        │   │   └── OrderDetailFeature.swift
        │   ├── Payment/
        │   │   ├── PaymentView.swift
        │   │   └── PaymentFeature.swift       # TimelineView 倒计时
        │   └── Data/
        │       ├── OrderAPI.swift
        │       ├── OrderClient.swift          # @DependencyClient
        │       ├── PaymentAPI.swift
        │       ├── PaymentClient.swift        # @DependencyClient
        │       └── Model/
        │           ├── Order.swift
        │           ├── OrderItem.swift
        │           ├── OrderStatus.swift
        │           └── Payment.swift
        │
        ├── User/                             # 用户
        │   ├── Profile/
        │   │   ├── ProfileView.swift
        │   │   └── ProfileFeature.swift
        │   ├── Address/
        │   │   ├── AddressView.swift
        │   │   └── AddressFeature.swift
        │   └── Data/
        │       ├── UserAPI.swift
        │       ├── UserClient.swift           # @DependencyClient
        │       ├── AddressAPI.swift
        │       ├── AddressClient.swift        # @DependencyClient
        │       └── Model/
        │           ├── User.swift
        │           └── Address.swift
        │
        └── Auth/                             # 认证
            ├── Login/
            │   ├── LoginView.swift
            │   └── LoginFeature.swift
            ├── Register/
            │   ├── RegisterView.swift
            │   └── RegisterFeature.swift
            └── Data/
                ├── AuthAPI.swift
                ├── AuthClient.swift           # @DependencyClient
                └── Model/
                    └── AuthToken.swift
```

---

## 架构改进（对比旧版 10 Phase 计划）

### 1. APIClient: `struct` 而非 `actor`

**问题：** 旧版使用 `actor APIClient`，所有网络调用被序列化。首页并行发 5 个请求（Banner + 分类 + Deal + 新品 + 推荐），会变成顺序执行。

**方案：** 改为 `struct APIClient: Sendable`，让 `async let` 并发正常工作。只有 `AuthManager` 保持 `actor`（需要序列化 token 刷新）。

```swift
// ════════ APIClient — struct Sendable，支持并发 ════════

struct APIClient: Sendable {
    private let baseURL: URL
    private let session: URLSession
    private let authManager: AuthManager

    /// 统一请求 — 全部 POST + JSON Body
    func request<T: Decodable>(
        _ endpoint: Endpoint,
        body: some Encodable & Sendable = EmptyBody(),
        needsAuth: Bool = false
    ) async throws -> T {
        var urlRequest = URLRequest(url: baseURL.appending(path: endpoint.path))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Token 注入（含主动刷新检查）
        if needsAuth {
            let token = try await authManager.validAccessToken()
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // 幂等 key（订单/支付）
        if endpoint.requiresIdempotency {
            urlRequest.setValue(
                IdempotencyKey.generate(),
                forHTTPHeaderField: "X-Idempotency-Key"
            )
        }

        urlRequest.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: urlRequest)

        // 401 自动刷新重试（仅一次）
        if let httpResponse = response as? HTTPURLResponse,
           httpResponse.statusCode == 401, needsAuth {
            try await authManager.refreshAccessToken()
            return try await rawRequest(endpoint, body: body, needsAuth: true)
        }

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

    /// rawRequest — 不做 401 重试，用于 refresh 自身
    func rawRequest<T: Decodable>(
        _ endpoint: Endpoint,
        body: some Encodable & Sendable = EmptyBody(),
        needsAuth: Bool = false
    ) async throws -> T {
        // 同 request 但不含 401 重试逻辑
        var urlRequest = URLRequest(url: baseURL.appending(path: endpoint.path))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if needsAuth {
            let token = try await authManager.validAccessToken()
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        urlRequest.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await session.data(for: urlRequest)
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
}
```

### 2. AuthManager: Coalesced refresh + 防循环

**问题：** 旧版用 `isRefreshing` bool 守卫，多个并发 401 会丢弃部分刷新；refresh 自身 401 会无限递归。

**方案：** 共享 `Task` coalesce 并发刷新，refresh 用 `rawRequest` 不触发 401 重试。

```swift
// ════════ AuthManager — actor，序列化 token 刷新 ════════

actor AuthManager {
    private let keychain: KeychainStore
    private var refreshTask: Task<String, Error>?

    /// 获取有效 accessToken，如快过期则主动刷新
    func validAccessToken() async throws -> String {
        // 主动刷新检查（60s 内过期）
        if let expiresAt = try keychain.getAccessTokenExpiresAt(),
           Date.now.addingTimeInterval(60) > expiresAt {
            return try await refreshAccessToken()
        }

        guard let token = try keychain.getAccessToken() else {
            throw APIError.unauthorized
        }
        return token
    }

    /// Coalesced refresh — 并发调用复用同一个 Task
    @discardableResult
    func refreshAccessToken() async throws -> String {
        if let existing = refreshTask {
            return try await existing.value
        }

        let task = Task<String, Error> {
            defer { refreshTask = nil }

            guard let refreshToken = try keychain.getRefreshToken() else {
                try keychain.clear()
                throw APIError.unauthorized
            }

            // 使用 rawRequest 避免 401 无限循环
            let result: AuthToken = try await APIClient.shared.rawRequest(
                .authRefresh,
                body: RefreshBody(refreshToken: refreshToken)
            )

            try keychain.save(token: result)
            return result.accessToken
        }

        refreshTask = task
        return try await task.value
    }

    func logout() async throws {
        refreshTask?.cancel()
        refreshTask = nil
        try keychain.clear()
    }
}
```

### 3. `@DependencyClient` 宏简化 DI

**问题：** 手动 `DependencyKey` conformance 每个 client 约 40 行样板代码。

**方案：** 用 TCA 内置 `@DependencyClient` 宏，约 10 行声明即可。

```swift
// ════════ 旧版：~40 行 ════════
struct ProductClient {
    var list: @Sendable (ProductListRequest) async throws -> PaginatedResult<Product>
    var detail: @Sendable (String) async throws -> ProductDetail
    var search: @Sendable (SearchRequest) async throws -> PaginatedResult<Product>
}
extension ProductClient: DependencyKey {
    static let liveValue = ProductClient(
        list: { try await APIClient.shared.request(.productList, body: $0) },
        detail: { try await APIClient.shared.request(.productDetail, body: ["id": $0]) },
        search: { try await APIClient.shared.request(.productSearch, body: $0) }
    )
    static let testValue = ProductClient(
        list: { _ in .mock },
        detail: { _ in .mock },
        search: { _ in .mock }
    )
}
extension DependencyValues {
    var productClient: ProductClient { ... }
}

// ════════ 新版：~10 行 ════════
@DependencyClient
struct ProductClient {
    var list: @Sendable (ProductListRequest) async throws -> PaginatedResult<Product>
    var detail: @Sendable (String) async throws -> ProductDetail
    var search: @Sendable (SearchRequest) async throws -> PaginatedResult<Product>
}

extension ProductClient: DependencyKey {
    static let liveValue = ProductClient(
        list: { try await APIClient.shared.request(.productList, body: $0) },
        detail: { try await APIClient.shared.request(.productDetail, body: ["id": $0]) },
        search: { try await APIClient.shared.request(.productSearch, body: $0) }
    )
}
// testValue 由 @DependencyClient 宏自动生成 unimplemented 版本
```

### 4. 泛型 `PaginationState<Item>`

**问题：** 首页推荐、商品列表、搜索结果、订单列表都需要分页逻辑，重复代码。

**方案：** 提取通用 `PaginationState<Item>` + 分页 Action/Reducer 逻辑。

```swift
// ════════ PaginationState — 复用于所有分页场景 ════════

struct PaginationState<Item: Equatable & Identifiable>: Equatable {
    var items: [Item] = []
    var page: Int = 1
    var totalPages: Int = 1
    var isLoading: Bool = false
    var isLoadingMore: Bool = false
    var hasMore: Bool { page < totalPages }

    mutating func reset() {
        items = []
        page = 1
        totalPages = 1
    }

    mutating func appendPage(_ newItems: [Item], pagination: Pagination) {
        if pagination.page == 1 {
            items = newItems
        } else {
            items.append(contentsOf: newItems)
        }
        page = pagination.page
        totalPages = pagination.totalPages
        isLoadingMore = false
        isLoading = false
    }
}

// 使用示例 — ProductListFeature
@ObservableState
struct State: Equatable {
    var pagination = PaginationState<Product>()
    var sort: SortOption = .newest
    var categoryId: String?
}
```

### 5. Toast 系统

**问题：** 旧版无 Toast 方案。添加购物车、操作成功/失败等场景需要轻量提示。

**方案：** `ToastManager` (@Observable) + `ToastView` 覆盖层，对标 H5 toast 和 Android Snackbar。

```swift
// ════════ ToastManager — 全局提示管理 ════════

@Observable
final class ToastManager {
    static let shared = ToastManager()

    var current: ToastItem?

    func show(_ message: String, type: ToastType = .success, duration: TimeInterval = 2) {
        current = ToastItem(message: message, type: type)
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(duration))
            current = nil
        }
    }
}

struct ToastItem: Equatable {
    let message: String
    let type: ToastType
    let id = UUID()
}

enum ToastType {
    case success, error, info
}

// ToastView — 叠加在 ContentView 顶层
struct ToastView: View {
    let item: ToastItem

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: item.type.icon)
            Text(item.message)
                .font(.subheadline)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(item.type.backgroundColor)
        .foregroundStyle(.white)
        .clipShape(Capsule())
        .shadow(radius: 4)
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}
```

### 6. 双类型 PriceFormatter（Day 1）

**问题：** 商品 API 返回字符串价格 `"7999.00"`，购物车/订单 API 返回数值价格 `7999.0`。Android 曾因忽略此差异出 Bug。

**方案：** 从 Phase 1 起同时支持 `String` 和 `Double` 价格格式化。

```swift
// ════════ PriceFormatter — 双类型，Day 1 就位 ════════

enum PriceFormatter {
    private static let formatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.minimumFractionDigits = 2
        f.maximumFractionDigits = 2
        return f
    }()

    /// 格式化字符串价格（商品列表/详情 API）
    /// "7999.00" → "7,999.00"
    static func format(_ price: String) -> String {
        guard let decimal = Decimal(string: price) else { return price }
        return formatter.string(from: decimal as NSDecimalNumber) ?? price
    }

    /// 格式化数值价格（购物车/订单 API）
    /// 7999.0 → "7,999.00"
    static func format(_ price: Double) -> String {
        formatter.string(from: NSNumber(value: price)) ?? String(format: "%.2f", price)
    }

    /// 带 ¥ 符号
    static func withSymbol(_ price: String) -> String { "¥\(format(price))" }
    static func withSymbol(_ price: Double) -> String { "¥\(format(price))" }
}
```

---

## 核心架构模式：TCA 单向数据流

与 H5 Zustand / Android MVI 对标：

```swift
// ════════ 对标 Zustand cartStore / Android CartViewModel ════════

import ComposableArchitecture

@Reducer
struct CartFeature {

    // 1. State — 对标 Zustand state / MVI UiState
    @ObservableState
    struct State: Equatable {
        var items: IdentifiedArrayOf<CartItem> = []
        var selectedIds: Set<String> = []
        var isLoading = false
        var totalPrice: Double = 0
        var totalQuantity: Int = 0
    }

    // 2. Action — 对标 Zustand actions / MVI Intent
    enum Action {
        // 用户操作
        case onAppear
        case toggleSelect(skuId: String)
        case updateQuantity(skuId: String, quantity: Int)
        case remove(skuId: String)
        case toggleSelectAll
        case checkoutTapped

        // 副作用结果
        case cartLoaded(Result<[CartItem], Error>)
        case updateCompleted(Result<Void, Error>)

        // 防抖
        case debouncedUpdate(skuId: String, quantity: Int)
    }

    // 3. Dependencies — @DependencyClient
    @Dependency(\.cartClient) var cartClient
    @Dependency(\.continuousClock) var clock

    // 4. Reducer — 状态转换 + 副作用
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {

            case .onAppear:
                state.isLoading = true
                return .run { send in
                    let result = await Result { try await cartClient.list() }
                    await send(.cartLoaded(result))
                }

            case let .updateQuantity(skuId, quantity):
                // 乐观更新 — 先改 UI
                state.items[id: skuId]?.quantity = quantity
                state.recalculate()
                // 300ms 防抖 — 对标 H5 debounce
                return .run { send in
                    try await clock.sleep(for: .milliseconds(300))
                    await send(.debouncedUpdate(skuId: skuId, quantity: quantity))
                }
                .cancellable(id: CancelID.quantityUpdate(skuId), cancelInFlight: true)

            case let .debouncedUpdate(skuId, quantity):
                return .run { _ in
                    try await cartClient.update(skuId, quantity)
                }

            // ... 其他 action
            default:
                return .none
            }
        }
    }

    private enum CancelID: Hashable {
        case quantityUpdate(String)
    }
}

// 5. View — 对标 React 组件 / Compose Screen
struct CartView: View {
    @Bindable var store: StoreOf<CartFeature>

    var body: some View {
        List {
            ForEach(store.items) { item in
                CartItemRow(
                    item: item,
                    isSelected: store.selectedIds.contains(item.skuId),
                    onToggle: { store.send(.toggleSelect(skuId: item.skuId)) },
                    onQuantityChange: { qty in
                        store.send(.updateQuantity(skuId: item.skuId, quantity: qty))
                    }
                )
            }
        }
        .onAppear { store.send(.onAppear) }
    }
}
```

---

## Token 安全存储

```swift
// ════════ Keychain 存储 — 含过期时间 ════════

final class KeychainStore: Sendable {
    private let service = "com.example.shop"

    func save(token: AuthToken) throws {
        try set(token.accessToken, for: "accessToken")
        try set(token.refreshToken, for: "refreshToken")
        try set(token.accessTokenExpiresAt, for: "accessTokenExpiresAt")
        try set(token.refreshTokenExpiresAt, for: "refreshTokenExpiresAt")
    }

    func getAccessToken() throws -> String? {
        try get(for: "accessToken")
    }

    func getRefreshToken() throws -> String? {
        try get(for: "refreshToken")
    }

    func getAccessTokenExpiresAt() throws -> Date? {
        guard let str = try get(for: "accessTokenExpiresAt") else { return nil }
        return ISO8601DateFormatter().date(from: str)
    }

    func clear() throws {
        for key in ["accessToken", "refreshToken", "accessTokenExpiresAt", "refreshTokenExpiresAt"] {
            try delete(for: key)
        }
    }

    // MARK: - Keychain 底层操作
    private func set(_ value: String, for key: String) throws { /* ... */ }
    private func get(for key: String) throws -> String? { /* ... */ }
    private func delete(for key: String) throws { /* ... */ }
}
```

---

## Endpoint 路由定义

```swift
enum Endpoint {
    // 认证
    case authLogin, authRegister, authRefresh, authLogout
    // 用户
    case userProfile, userUpdate
    // 地址
    case addressList, addressCreate, addressUpdate, addressDelete
    // 商品
    case productList, productDetail, productSearch
    // 分类
    case categoryTree, categoryList
    // Banner
    case bannerList
    // 购物车
    case cartList, cartAdd, cartUpdate, cartRemove, cartSelect, cartCheckoutPreview
    // 订单
    case orderCreate, orderList, orderDetail, orderCancel
    // 支付
    case paymentCreate, paymentQuery

    var path: String {
        switch self {
        case .authLogin:            return "/api/v1/auth/login"
        case .authRegister:         return "/api/v1/auth/register"
        case .authRefresh:          return "/api/v1/auth/refresh"
        case .authLogout:           return "/api/v1/auth/logout"
        case .userProfile:          return "/api/v1/user/profile"
        case .userUpdate:           return "/api/v1/user/update"
        case .addressList:          return "/api/v1/user/address/list"
        case .addressCreate:        return "/api/v1/user/address/create"
        case .addressUpdate:        return "/api/v1/user/address/update"
        case .addressDelete:        return "/api/v1/user/address/delete"
        case .productList:          return "/api/v1/product/list"
        case .productDetail:        return "/api/v1/product/detail"
        case .productSearch:        return "/api/v1/product/search"
        case .categoryTree:         return "/api/v1/category/tree"
        case .categoryList:         return "/api/v1/category/list"
        case .bannerList:           return "/api/v1/banner/list"
        case .cartList:             return "/api/v1/cart/list"
        case .cartAdd:              return "/api/v1/cart/add"
        case .cartUpdate:           return "/api/v1/cart/update"
        case .cartRemove:           return "/api/v1/cart/remove"
        case .cartSelect:           return "/api/v1/cart/select"
        case .cartCheckoutPreview:  return "/api/v1/cart/checkout/preview"
        case .orderCreate:          return "/api/v1/order/create"
        case .orderList:            return "/api/v1/order/list"
        case .orderDetail:          return "/api/v1/order/detail"
        case .orderCancel:          return "/api/v1/order/cancel"
        case .paymentCreate:        return "/api/v1/payment/create"
        case .paymentQuery:         return "/api/v1/payment/query"
        }
    }

    var requiresIdempotency: Bool {
        switch self {
        case .orderCreate, .paymentCreate: return true
        default: return false
        }
    }
}
```

---

## 分阶段实现计划

共 7 个 Phase，对齐 Android 项目结构。每个 Phase 可独立验证。

---

### Phase 1 — 核心基础设施 + 主题 `[ ]`

> 搭建项目骨架 + 所有架构改进，后续 Phase 的地基。

**目标：** 项目能运行，网络能通，Token 能存取，PaginationState / Toast / PriceFormatter 就位。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `Shop.xcodeproj` | Xcode 项目配置，iOS 17+ |
| `Package.swift` | SPM 依赖：TCA、Kingfisher |
| `ShopApp.swift` | `@main` App 入口，Toast 覆盖层 |
| `ContentView.swift` | 临时根视图 |
| `Core/Network/APIClient.swift` | **struct Sendable**，支持并发 `async let` |
| `Core/Network/APIResponse.swift` | `{ code, success, data, message, meta }` Codable |
| `Core/Network/APIError.swift` | 统一异常，支持 `err.is(.stockInsufficient)` |
| `Core/Network/AuthManager.swift` | **actor**，coalesced refresh + rawRequest 防循环 |
| `Core/Network/Endpoint.swift` | 全部 API 路由枚举 |
| `Core/Network/IdempotencyKey.swift` | UUID 幂等 key 生成 |
| `Core/Storage/KeychainStore.swift` | Keychain 加密存储 token + **过期时间** |
| `Core/Storage/SearchHistoryStore.swift` | UserDefaults 搜索历史 |
| `Core/Model/PaginatedResult.swift` | 分页响应 Codable |
| `Core/Model/PaginationState.swift` | **泛型分页状态** `PaginationState<Item>` |
| `Core/Model/ErrorCode.swift` | 业务错误码 |
| `Core/UI/Theme/ShopColors.swift` | Amazon 色系 Color 扩展 |
| `Core/UI/Theme/ShopFonts.swift` | 字体系统 |
| `Core/UI/Theme/ShopDimens.swift` | 尺寸规范 |
| `Core/UI/Component/ToastView.swift` | **Toast 提示组件 + ToastManager** |
| `Core/Util/PriceFormatter.swift` | **双类型**（String + Double）金额格式化 |
| `Core/Util/DateFormatter+Shop.swift` | 日期格式化 |
| `Core/Util/View+Extensions.swift` | View 扩展 |
| `Core/DI/Dependencies.swift` | TCA **@DependencyClient** 注册 |

**核心代码示例：**

```swift
// ShopColors.swift
extension Color {
    static let shopPrimary = Color(hex: "#131921")
    static let shopAccent = Color(hex: "#FF9900")
    static let shopAccentPressed = Color(hex: "#E68A00")
    static let shopPrice = Color(hex: "#B12704")
    static let shopTeal = Color(hex: "#007185")
    static let shopSuccess = Color(hex: "#067D62")
    static let shopBackground = Color(hex: "#EAEDED")
    static let shopText = Color(hex: "#0F1111")
    static let shopTextSecondary = Color(hex: "#565959")
    static let shopDivider = Color(hex: "#DDDDDD")
    static let shopStar = Color(hex: "#FFA41C")
}

// APIError.swift
struct APIError: Error, Equatable {
    let code: Int
    let errorCode: String?
    let message: String

    func `is`(_ expected: ErrorCode) -> Bool {
        errorCode == expected.rawValue
    }

    static let unauthorized = APIError(code: 401, errorCode: nil, message: "Unauthorized")
}

// ErrorCode.swift
enum ErrorCode: String {
    case userNotFound = "USER_NOT_FOUND"
    case emailAlreadyExists = "EMAIL_ALREADY_EXISTS"
    case invalidCredentials = "INVALID_CREDENTIALS"
    case productNotFound = "PRODUCT_NOT_FOUND"
    case skuNotFound = "SKU_NOT_FOUND"
    case stockInsufficient = "STOCK_INSUFFICIENT"
    case cartItemNotFound = "CART_ITEM_NOT_FOUND"
    case cartExceedLimit = "CART_EXCEED_LIMIT"
    case orderNotFound = "ORDER_NOT_FOUND"
    case orderCannotCancel = "ORDER_CANNOT_CANCEL"
    case orderExpired = "ORDER_EXPIRED"
    case paymentAlreadyPaid = "PAYMENT_ALREADY_PAID"
    case addressNotFound = "ADDRESS_NOT_FOUND"
    case tokenExpired = "TOKEN_EXPIRED"
    case tokenInvalid = "TOKEN_INVALID"
}
```

**验收标准：**
- [ ] 项目编译通过，Xcode 运行空白页
- [ ] APIClient（struct）能请求 `/api/v1/product/list` 并解析
- [ ] 多个并发 `async let` 请求能并行执行
- [ ] Token Keychain 存取正常（含过期时间）
- [ ] AuthManager coalesced refresh 工作正常
- [ ] TCA `@DependencyClient` 注入正常
- [ ] PriceFormatter 处理 String `"7999.00"` → `"¥7,999.00"` 和 Double `7999.0` → `"¥7,999.00"`
- [ ] PaginationState 泛型编译通过
- [ ] Toast 提示可显示/自动消失
- [ ] Amazon 色系定义完整

---

### Phase 2 — 导航框架 + 认证流程 `[ ]`

> TabView + NavigationStack 骨架，登录/注册闭环。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `Navigation/AppTab.swift` | Tab 枚举：home, profile, cart, menu |
| `Navigation/AppRouter.swift` | NavigationPath 路由定义 |
| `Navigation/MainTabView.swift` | TabView + 各 Tab NavigationStack |
| `Feature/Auth/Data/AuthAPI.swift` | 认证 API 调用 |
| `Feature/Auth/Data/AuthClient.swift` | @DependencyClient |
| `Feature/Auth/Data/Model/AuthToken.swift` | Token 数据模型 |
| `Feature/Auth/Login/LoginView.swift` | 登录页 UI |
| `Feature/Auth/Login/LoginFeature.swift` | 登录 TCA Reducer |
| `Feature/Auth/Register/RegisterView.swift` | 注册页 UI |
| `Feature/Auth/Register/RegisterFeature.swift` | 注册 TCA Reducer |

**导航架构：**

```swift
// AppTab.swift
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

// AppRouter.swift — 类型安全路由
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

// MainTabView.swift
struct MainTabView: View {
    @State private var selectedTab: AppTab = .home
    @State private var homePath = NavigationPath()
    @State private var profilePath = NavigationPath()
    @State private var cartPath = NavigationPath()
    @State private var menuPath = NavigationPath()

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack(path: $homePath) {
                HomeView(store: ...)
                    .navigationDestination(for: AppRoute.self) { route in
                        routeView(route)
                    }
            }
            .tabItem { Label(AppTab.home.title, systemImage: AppTab.home.icon) }
            .tag(AppTab.home)

            // ... 其他 Tab 各自 NavigationStack
        }
        .tint(.shopTeal)
    }
}
```

**数据模型：**

```swift
// AuthToken.swift
struct AuthToken: Codable {
    let accessToken: String
    let refreshToken: String
    let accessTokenExpiresAt: String   // ISO 8601
    let refreshTokenExpiresAt: String
}

// AuthClient.swift
@DependencyClient
struct AuthClient {
    var login: @Sendable (LoginRequest) async throws -> AuthResponse
    var register: @Sendable (RegisterRequest) async throws -> AuthResponse
    var logout: @Sendable (String?) async throws -> Void
}

struct LoginRequest: Encodable {
    let email: String
    let password: String
}

struct RegisterRequest: Encodable {
    let email: String
    let password: String
    let nickname: String?
}

struct AuthResponse: Decodable {
    let user: User
    let accessToken: String
    let refreshToken: String
    let accessTokenExpiresAt: String
    let refreshTokenExpiresAt: String
}
```

**底栏规格（对标 H5 / Android）：**
- 系统 TabView，tint 色 `#007185` (teal)
- SF Symbols 图标
- Cart Tab 右上角 `.badge(cartCount)`

**验收标准：**
- [ ] 4 Tab 切换，高亮正确
- [ ] 每个 Tab 独立 NavigationStack
- [ ] 登录表单验证（邮箱格式 + 密码 8+ 位）+ API 调用
- [ ] 注册表单验证 + API 调用
- [ ] 登录/注册成功 → 存 Keychain（含过期时间）→ 跳转首页
- [ ] 已登录访问登录页 → 重定向
- [ ] 未登录访问购物车 → 弹登录页

---

### Phase 3 — 首页 Home + 共享组件 `[ ]`

> 用户看到的第一个页面，Amazon 风格多区块 + 全部共享 UI 组件。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `Core/UI/Component/ProductCard.swift` | 商品卡片（图片+标题+价格+评分） |
| `Core/UI/Component/ProductGrid.swift` | LazyVGrid 2 列 + PaginationState 无限滚动 |
| `Core/UI/Component/SortBar.swift` | 排序切换栏 |
| `Core/UI/Component/PriceText.swift` | 价格显示（双类型：¥大字+小数+划线价） |
| `Core/UI/Component/QuantityStepper.swift` | 数量 +/- 步进器 |
| `Core/UI/Component/RatingStars.swift` | 星级评分 |
| `Core/UI/Component/SkeletonView.swift` | 骨架屏加载占位 |
| `Core/UI/Component/EmptyStateView.swift` | 空状态提示 |
| `Core/UI/Component/LoadingButton.swift` | 带 loading 按钮 |
| `Feature/Home/HomeView.swift` | ScrollView 多区块 |
| `Feature/Home/HomeFeature.swift` | TCA Reducer，**async let 并行加载** |
| `Feature/Home/Component/BannerCarousel.swift` | TabView + Timer 3s 自动翻页 |
| `Feature/Home/Component/CategoryPills.swift` | ScrollView(.horizontal) 胶囊 |
| `Feature/Home/Component/DealSection.swift` | Deal of the Day 横滑 |
| `Feature/Home/Component/CategoryShowcase.swift` | 分类展示 2x2 |
| `Feature/Home/Component/NewArrivalsSection.swift` | 新品横滑 |
| `Feature/Home/Component/TopRatedSection.swift` | 好评横滑 |
| `Feature/Home/Data/HomeAPI.swift` | Banner API |
| `Feature/Home/Data/HomeClient.swift` | @DependencyClient |
| `Feature/Product/Data/ProductAPI.swift` | 商品 API（首页复用） |
| `Feature/Product/Data/ProductClient.swift` | @DependencyClient |
| `Feature/Product/Data/Model/Product.swift` | 商品列表模型（minPrice: String） |
| `Feature/Menu/Data/CategoryAPI.swift` | 分类 API（首页复用） |
| `Feature/Menu/Data/CategoryClient.swift` | @DependencyClient |
| `Feature/Menu/Data/Model/Category.swift` | 分类树模型 |

**页面结构（ScrollView）：**

```
┌─────────────────────────────────┐
│ [深色搜索栏] — 点击跳转搜索页     │
│ 📍 Deliver to Alice — Shanghai  │
├─────────────────────────────────┤
│ [分类胶囊] ScrollView(.horizontal)│
├─────────────────────────────────┤
│ [Banner] TabView + .tabViewStyle │
│   (.page) + Timer 3秒自动切换    │
│   PageTabViewStyle 圆点指示器     │
├─────────────────────────────────┤
│ Deal of the Day                 │
│ [横滑] ScrollView(.horizontal)   │
├─────────────────────────────────┤
│ [分类展示] LazyVGrid 2x2        │
├─────────────────────────────────┤
│ New Arrivals                    │
│ [横滑] ScrollView(.horizontal)   │
├─────────────────────────────────┤
│ Top Rated                       │
│ [横滑] ScrollView(.horizontal)   │
├─────────────────────────────────┤
│ Recommended for You             │
│ ProductGrid + PaginationState    │
│ onAppear 触发下一页（无限滚动）    │
└─────────────────────────────────┘
```

**数据模型：**

```swift
// Product.swift — 商品列表项（minPrice 为 String）
struct Product: Codable, Equatable, Identifiable {
    let id: String
    let title: String
    let slug: String
    let brand: String?
    let status: String
    let minPrice: String?       // 字符串元价格 "7999.00"
    let maxPrice: String?
    let totalSales: Int
    let avgRating: String       // "4.5"
    let reviewCount: Int
    let primaryImage: String?
    let createdAt: String
}

// Category.swift — 分类树
struct CategoryNode: Codable, Equatable, Identifiable {
    let id: String
    let name: String
    let slug: String
    let iconUrl: String?
    let sortOrder: Int
    let isActive: Bool
    let children: [CategoryNode]?
}

// Banner.swift
struct Banner: Codable, Equatable, Identifiable {
    let id: String
    let title: String
    let subtitle: String?
    let imageUrl: String
    let linkType: String       // "product" | "category"
    let linkValue: String?
    let sortOrder: Int
    let isActive: Bool
    let startAt: String?
    let endAt: String?
    let createdAt: String
    let updatedAt: String
}
```

**首页并行加载（async let）：**

```swift
// HomeFeature.swift — 利用 struct APIClient 支持真正并发
case .onAppear:
    state.isLoading = true
    return .run { send in
        async let banners = homeClient.banners()
        async let categories = categoryClient.tree()
        async let deals = productClient.list(.init(sort: "sales", order: "desc", pageSize: 10))
        async let newArrivals = productClient.list(.init(sort: "createdAt", order: "desc", pageSize: 10))
        async let recommended = productClient.list(.init(page: 1))

        let result = try await HomeData(
            banners: banners,
            categories: categories,
            deals: deals.items,
            newArrivals: newArrivals.items,
            recommended: recommended
        )
        await send(.dataLoaded(.success(result)))
    }
```

**API 调用映射：**

| 区域 | API | 参数 |
|------|-----|------|
| 分类胶囊 | `POST /api/v1/category/tree` | `{}` |
| Banner | `POST /api/v1/banner/list` | `{}` |
| Deal of the Day | `POST /api/v1/product/list` | `sort: "sales", order: "desc", pageSize: 10` |
| New Arrivals | `POST /api/v1/product/list` | `sort: "createdAt", order: "desc", pageSize: 10` |
| Top Rated | `POST /api/v1/product/list` | `sort: "createdAt", order: "desc", pageSize: 10` |
| Recommended | `POST /api/v1/product/list` | `sort: "createdAt", order: "desc"` + 分页 |

**验收标准：**
- [ ] 搜索栏点击跳转搜索页
- [ ] 分类胶囊横滑，点击跳转商品列表（传 categoryId + categoryName）
- [ ] Banner 自动轮播 3 秒 + 手势滑动 + 圆点指示器
- [ ] Deal / New Arrivals / Top Rated 横滑商品卡片
- [ ] 推荐区 2 列网格 PaginationState 无限滚动
- [ ] 首次加载显示骨架屏
- [ ] 下拉刷新 `.refreshable`
- [ ] ProductCard 显示图片、标题、价格（PriceText 双类型）、评分（RatingStars）
- [ ] 点击商品卡片跳转详情页

---

### Phase 4 — 商品发现（搜索 + 分类菜单 + 商品列表） `[ ]`

> 合并搜索、分类浏览、商品列表 — 全部复用 ProductGrid / SortBar / PaginationState。

#### 4a. 搜索页 Search

| 文件 | 说明 |
|------|------|
| `Feature/Product/Search/SearchView.swift` | 搜索 UI |
| `Feature/Product/Search/SearchFeature.swift` | TCA Reducer，使用 PaginationState |

**搜索状态设计：**

```swift
@Reducer
struct SearchFeature {
    @ObservableState
    struct State: Equatable {
        var keyword = ""
        var phase: Phase = .idle

        enum Phase: Equatable {
            case idle(history: [String])        // 初始态：搜索历史
            case searching                      // 搜索中
            case results                        // 有结果
            case empty                          // 无结果
        }

        var pagination = PaginationState<Product>()
        var sort: SearchSort = .relevance
    }

    enum Action: BindableAction {
        case binding(BindingAction<State>)
        case onAppear
        case submitSearch
        case selectKeyword(String)
        case clearHistory
        case changeSort(SearchSort)
        case loadNextPage
        case searchResponse(Result<PaginatedResult<Product>, Error>)
    }
}

enum SearchSort: String, CaseIterable {
    case relevance, priceAsc = "price_asc", priceDesc = "price_desc", sales, newest
}
```

#### 4b. 分类菜单 Menu

| 文件 | 说明 |
|------|------|
| `Feature/Menu/MenuView.swift` | HStack 左右分栏 |
| `Feature/Menu/MenuFeature.swift` | TCA Reducer |

**布局：**

```swift
HStack(spacing: 0) {
    // 左栏：一级分类 — 88pt 宽，shopBackground 底色
    ScrollView {
        LazyVStack(spacing: 0) {
            ForEach(store.categories) { cat in
                CategoryTab(
                    name: cat.name,
                    isSelected: cat.id == store.selectedId,
                    onTap: { store.send(.selectCategory(cat.id)) }
                )
            }
        }
    }
    .frame(width: 88)
    .background(Color.shopBackground)

    // 右栏：二级分类 — 3 列网格
    ScrollView {
        LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 3)) {
            ForEach(store.subcategories) { sub in
                SubcategoryCard(category: sub)
                    .onTapGesture {
                        store.send(.navigateToProducts(categoryId: sub.id, name: sub.name))
                    }
            }
        }
    }
}
```

#### 4c. 商品列表

| 文件 | 说明 |
|------|------|
| `Feature/Product/List/ProductListView.swift` | 列表 UI，SortBar + ProductGrid |
| `Feature/Product/List/ProductListFeature.swift` | TCA Reducer，使用 PaginationState |

```swift
@Reducer
struct ProductListFeature {
    @ObservableState
    struct State: Equatable {
        var pagination = PaginationState<Product>()
        var sort: String = "createdAt"
        var order: String = "desc"
        var categoryId: String?
        var categoryName: String?
    }

    enum Action {
        case onAppear
        case changeSort(String, String)
        case loadNextPage
        case productsLoaded(Result<PaginatedResult<Product>, Error>)
    }
}
```

**验收标准：**
- [ ] 搜索输入框自动聚焦 `@FocusState`
- [ ] 搜索历史持久化（UserDefaults），最多 10 条
- [ ] 点击历史词填入并搜索
- [ ] 清除历史
- [ ] 搜索排序切换（综合/价格↑/价格↓/销量/最新）
- [ ] 搜索结果无限滚动分页
- [ ] 分类菜单左侧一级分类切换
- [ ] 分类右侧显示对应二级分类
- [ ] 选中态：白色背景 + 左侧 3pt teal 竖条
- [ ] 点击二级分类跳转商品列表
- [ ] 商品列表排序切换 + SortBar
- [ ] 商品列表无限滚动 PaginationState

---

### Phase 5 — 商品详情 + 购物车 `[ ]`

> 合并详情和购物车 — 浏览到购买的完整漏斗。

#### 5a. 商品详情

| 文件 | 说明 |
|------|------|
| `Feature/Product/Detail/ProductDetailView.swift` | 详情 UI |
| `Feature/Product/Detail/ProductDetailFeature.swift` | SKU 选择逻辑 |
| `Feature/Product/Detail/Component/ImageCarousel.swift` | TabView 图片轮播 |
| `Feature/Product/Detail/Component/SkuSelector.swift` | SKU 属性选择 |
| `Feature/Product/Data/Model/ProductDetail.swift` | 详情模型 |
| `Feature/Product/Data/Model/Sku.swift` | SKU 模型（price: String） |

**详情页结构：**

```
┌─────────────────────────────────┐
│ ←                    🛒   ⋮     │  .toolbar
├─────────────────────────────────┤
│ ┌─ TabView ──────────────────┐ │
│ │ 商品图片轮播                 │ │  .tabViewStyle(.page)
│ │          1 / 3              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ¥7,999                         │  PriceText（String 类型）
│ ¥9,999 (划线价)    -20%         │
├─────────────────────────────────┤
│ iPhone 15 Pro 256GB             │
│ ⭐⭐⭐⭐☆ 4.5  (2000+ ratings)   │  RatingStars
├─────────────────────────────────┤
│ 规格选择                        │
│ [128GB] [256GB ✓] [512GB]      │  SkuSelector
├─────────────────────────────────┤
│ About this item                 │
│ 商品描述文字...                  │
├─────────────────────────────────┤
│ ┌──────────────┬──────────────┐ │  .safeAreaInset(edge: .bottom)
│ │  Add to Cart │  Buy Now     │ │
│ └──────────────┴──────────────┘ │
└─────────────────────────────────┘
```

**数据模型：**

```swift
// ProductDetail.swift
struct ProductDetail: Codable, Equatable {
    let id: String
    let title: String
    let slug: String
    let description: String?
    let brand: String?
    let status: String
    let attributes: [String: String]?
    let minPrice: String?       // String 类型
    let maxPrice: String?
    let totalSales: Int
    let avgRating: String
    let reviewCount: Int
    let createdAt: String
    let updatedAt: String
    let images: [ProductImage]
    let skus: [Sku]
    let categories: [ProductCategory]
}

struct ProductImage: Codable, Equatable, Identifiable {
    let id: String
    let url: String
    let altText: String?
    let isPrimary: Bool
    let sortOrder: Int
}

// Sku.swift — price 为 String（商品接口）
struct Sku: Codable, Equatable, Identifiable {
    let id: String
    let skuCode: String
    let price: String           // "7999.00" — 字符串
    let comparePrice: String?
    let stock: Int
    let attributes: [String: String]
    let status: String
}

struct ProductCategory: Codable, Equatable {
    let id: String
    let name: String
    let slug: String
}
```

**SKU 选择逻辑（与 H5 / Android 一致）：**

```swift
// 从 skus[] 提取属性维度
// 例：["颜色": ["黑色","白色"], "内存": ["128GB","256GB","512GB"]]
// 用户选择后匹配唯一 SKU → 更新价格/库存
// stock == 0 的选项 → disabled 样式
```

#### 5b. 购物车

| 文件 | 说明 |
|------|------|
| `Feature/Cart/CartView.swift` | 购物车 UI |
| `Feature/Cart/CartFeature.swift` | 乐观更新 + 300ms 防抖 |
| `Feature/Cart/Data/CartAPI.swift` | Cart API 调用 |
| `Feature/Cart/Data/CartClient.swift` | @DependencyClient |
| `Feature/Cart/Data/Model/CartItem.swift` | **price: Double**（购物车接口返回数值） |
| `Feature/Cart/Data/Model/CheckoutPreview.swift` | 结算预览模型 |

**购物车数据模型（注意 Double 价格）：**

```swift
// CartItem.swift — price 为 Double（购物车接口）
struct CartItem: Codable, Equatable, Identifiable {
    let skuId: String
    var quantity: Int
    var selected: Bool
    let productId: String
    let productTitle: String
    let skuCode: String
    let price: Double           // 7999.0 — 数值
    let comparePrice: Double?
    let stock: Int
    let attributes: [String: String]
    let imageUrl: String?
    let status: String

    var id: String { skuId }
}

// CheckoutPreview.swift
struct CheckoutPreview: Codable, Equatable {
    let items: [CheckoutItem]
    let totalAmount: Double
    let totalQuantity: Int
}

struct CheckoutItem: Codable, Equatable {
    let skuId: String
    let quantity: Int
    let productId: String
    let productTitle: String
    let skuCode: String
    let price: Double
    let attributes: [String: String]
    let imageUrl: String?
    let subtotal: Double
}
```

**购物车页面结构：**

```
┌─────────────────────────────────┐
│ Shopping Cart (3)               │  .navigationTitle
├─────────────────────────────────┤
│ ☑ ┌────┐ iPhone 15 Pro         │  List
│   │ img│ 256GB 原色钛金属       │
│   └────┘ ¥9,999       [- 1 +]  │  PriceText(Double) + QuantityStepper
│                .swipeActions 删除│
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ ☑ ┌────┐ 运动T恤               │
│   │ img│ L 黑色                 │
│   └────┘ ¥99          [- 2 +]  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │  .safeAreaInset(edge: .bottom)
│ │ ☑ 全选  小计: ¥10,098 (2件) │ │
│ │ [ Proceed to Checkout      ]│ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**API 调用：**

| 操作 | API | 参数 |
|------|-----|------|
| 商品详情 | `POST /api/v1/product/detail` | `{ id }` |
| 加购 | `POST /api/v1/cart/add` | `{ skuId, quantity }` |
| 购物车列表 | `POST /api/v1/cart/list` | `{}` |
| 更新数量 | `POST /api/v1/cart/update` | `{ skuId, quantity }` |
| 移除 | `POST /api/v1/cart/remove` | `{ skuIds }` |
| 勾选 | `POST /api/v1/cart/select` | `{ skuIds, selected }` |
| 结算预览 | `POST /api/v1/cart/checkout/preview` | `{}` |

**验收标准：**
- [ ] 详情页图片 TabView 轮播 + 页码指示
- [ ] SKU 选择器联动价格/库存
- [ ] 库存为 0 禁用选项（disabled 样式）
- [ ] Add to Cart → **Toast 提示** "Added to cart"
- [ ] Buy Now → 直接跳订单确认
- [ ] 底部栏固定 `.safeAreaInset(edge: .bottom)`
- [ ] 购物车未登录 → 空状态 + "Sign in"
- [ ] 购物车列表正确渲染（**PriceText Double 类型**）
- [ ] 勾选联动小计计算
- [ ] 数量乐观更新 + 300ms 防抖
- [ ] `.swipeActions` 左滑删除
- [ ] 全选/取消全选
- [ ] Proceed to Checkout 跳转订单确认

---

### Phase 6 — 订单 + 支付 + 地址 `[ ]`

> 下单 → 支付 → 查看完整闭环，地址管理移入此 Phase（下单依赖地址）。

#### 6a. 订单确认页

| 文件 | 说明 |
|------|------|
| `Feature/Order/Create/OrderCreateView.swift` | 确认页 UI |
| `Feature/Order/Create/OrderCreateFeature.swift` | TCA Reducer |

- 地址选择（`.sheet` 弹出地址列表）
- 商品清单 + 金额汇总
- "Place Order" → `POST /api/v1/order/create` + 幂等 key

#### 6b. 支付页

| 文件 | 说明 |
|------|------|
| `Feature/Order/Payment/PaymentView.swift` | 支付 UI |
| `Feature/Order/Payment/PaymentFeature.swift` | TCA Reducer + TimelineView |

- 金额显示 + 支付方式选择
- 30 分钟倒计时（`TimelineView`）
- "Pay Now" → `POST /api/v1/payment/create` + 幂等 key
- 成功 → 跳转订单详情

#### 6c. 订单列表

| 文件 | 说明 |
|------|------|
| `Feature/Order/List/OrderListView.swift` | 列表 UI |
| `Feature/Order/List/OrderListFeature.swift` | TCA Reducer + PaginationState |

- Tab 切换：All / Pending / Paid / Shipped / Delivered / Completed / Cancelled
- 自定义 ScrollableTabBar（ScrollView(.horizontal)）
- PaginationState 无限滚动

#### 6d. 订单详情

| 文件 | 说明 |
|------|------|
| `Feature/Order/Detail/OrderDetailView.swift` | 详情 UI |
| `Feature/Order/Detail/OrderDetailFeature.swift` | TCA Reducer |

- 状态 Banner
- 地址 + 商品 + 金额明细
- 操作按钮（取消/支付/确认收货）
- `.confirmationDialog` 取消确认

#### 6e. 地址管理

| 文件 | 说明 |
|------|------|
| `Feature/User/Address/AddressView.swift` | 地址列表 + sheet 表单 |
| `Feature/User/Address/AddressFeature.swift` | CRUD TCA Reducer |
| `Feature/User/Data/AddressAPI.swift` | 地址 API |
| `Feature/User/Data/AddressClient.swift` | @DependencyClient |
| `Feature/User/Data/Model/Address.swift` | 地址模型 |

#### 6f. 数据层

| 文件 | 说明 |
|------|------|
| `Feature/Order/Data/OrderAPI.swift` | 订单 API |
| `Feature/Order/Data/OrderClient.swift` | @DependencyClient |
| `Feature/Order/Data/PaymentAPI.swift` | 支付 API |
| `Feature/Order/Data/PaymentClient.swift` | @DependencyClient |
| `Feature/Order/Data/Model/Order.swift` | 订单模型 |
| `Feature/Order/Data/Model/OrderItem.swift` | 订单商品模型 |
| `Feature/Order/Data/Model/OrderStatus.swift` | 状态枚举 |
| `Feature/Order/Data/Model/Payment.swift` | 支付模型 |

**数据模型：**

```swift
// Order.swift
struct Order: Codable, Equatable, Identifiable {
    let id: String
    let orderNo: String
    let userId: String
    let status: String
    let totalAmount: Double     // 数值价格
    let payAmount: Double
    let remark: String?
    let expiredAt: String?
    let createdAt: String
    let updatedAt: String
    let items: [OrderItem]
    let address: OrderAddress?
}

// OrderItem.swift
struct OrderItem: Codable, Equatable, Identifiable {
    let id: String
    let skuId: String
    let productId: String
    let productTitle: String
    let skuCode: String
    let skuAttributes: [String: String]
    let imageUrl: String?
    let price: Double           // 数值价格
    let quantity: Int
    let subtotal: Double
}

struct OrderAddress: Codable, Equatable {
    let recipient: String
    let phone: String
    let province: String
    let city: String
    let district: String
    let address: String
    let postalCode: String?
}

// OrderStatus.swift
enum OrderStatus: String, CaseIterable {
    case all = ""
    case pending, paid, shipped, delivered, completed, cancelled, refunded

    var title: String {
        switch self {
        case .all: "All"
        case .pending: "Pending"
        case .paid: "Paid"
        case .shipped: "Shipped"
        case .delivered: "Delivered"
        case .completed: "Completed"
        case .cancelled: "Cancelled"
        case .refunded: "Refunded"
        }
    }
}

// Address.swift
struct Address: Codable, Equatable, Identifiable {
    let id: String
    let userId: String
    let label: String?
    let recipient: String
    let phone: String
    let province: String
    let city: String
    let district: String
    let address: String
    let postalCode: String?
    let isDefault: Bool
    let createdAt: String
    let updatedAt: String
}

// Payment.swift
struct Payment: Codable, Equatable {
    let id: String
    let orderId: String
    let transactionId: String?
    let method: String
    let amount: Double
    let status: String
    let createdAt: String
}
```

**API 调用：**

| 操作 | API | 认证 | 幂等 |
|------|-----|------|------|
| 创建订单 | `POST /api/v1/order/create` | ✅ | ✅ |
| 订单列表 | `POST /api/v1/order/list` | ✅ | — |
| 订单详情 | `POST /api/v1/order/detail` | ✅ | — |
| 取消订单 | `POST /api/v1/order/cancel` | ✅ | — |
| 发起支付 | `POST /api/v1/payment/create` | ✅ | ✅ |
| 查询支付 | `POST /api/v1/payment/query` | ✅ | — |
| 地址列表 | `POST /api/v1/user/address/list` | ✅ | — |
| 新增地址 | `POST /api/v1/user/address/create` | ✅ | — |
| 更新地址 | `POST /api/v1/user/address/update` | ✅ | — |
| 删除地址 | `POST /api/v1/user/address/delete` | ✅ | — |

**验收标准：**
- [ ] 确认页展示地址 + 商品 + 金额（Double 类型 PriceText）
- [ ] 地址选择 Sheet
- [ ] 幂等 key 防重复提交
- [ ] 下单成功 → 支付页
- [ ] 支付倒计时 `TimelineView`
- [ ] 支付成功 → 订单详情
- [ ] 订单列表 Tab 筛选 + PaginationState 分页
- [ ] 订单详情按状态显示操作按钮
- [ ] 取消订单 `.confirmationDialog` 确认弹窗
- [ ] 地址列表 + 新增/编辑（`.sheet`）
- [ ] 设为默认地址
- [ ] 滑动删除地址

---

### Phase 7 — 个人中心 + 全局优化 `[ ]`

> 最后一个功能页面 + 全局打磨。

#### 7a. 个人中心

| 文件 | 说明 |
|------|------|
| `Feature/User/Profile/ProfileView.swift` | Amazon "Your Account" 风格 |
| `Feature/User/Profile/ProfileFeature.swift` | TCA Reducer |
| `Feature/User/Data/UserAPI.swift` | 用户 API |
| `Feature/User/Data/UserClient.swift` | @DependencyClient |
| `Feature/User/Data/Model/User.swift` | 用户模型 |

**页面结构：**

```
┌─────────────────────────────────┐
│ Hello, Alice 👋                  │
├─────────────────────────────────┤
│ ┌────────┐ ┌────────┐          │  LazyVGrid 2x2
│ │  📦    │ │  📍    │          │
│ │ Orders │ │Address │          │
│ └────────┘ └────────┘          │
│ ┌────────┐ ┌────────┐          │
│ │  👤    │ │  🚪    │          │
│ │Account │ │Sign Out│          │
│ └────────┘ └────────┘          │
├─────────────────────────────────┤
│ Your Orders                     │
│ ┌──────────────────────────┐   │
│ │ #ORD...  Pending          │   │  最近 3 条
│ │ iPhone 15 Pro  ¥9,999    │   │
│ └──────────────────────────┘   │
│ [See all orders →]             │
└─────────────────────────────────┘
```

**数据模型：**

```swift
// User.swift
struct User: Codable, Equatable {
    let id: String
    let email: String
    let nickname: String?
    let avatarUrl: String?
    let phone: String?
    let status: String
    let lastLogin: String?
    let createdAt: String
    let updatedAt: String
}
```

#### 7b. 全局优化

| 优化项 | iOS 实现 |
|--------|---------|
| 下拉刷新 | `.refreshable { }` 全局生效 |
| 网络异常 | `NWPathMonitor` 全局监听 + 离线横幅 |
| 深色模式 | `@Environment(\.colorScheme)` + ShopColors dark 变体 |
| 安全区域 | SwiftUI 自动处理 |
| 转场动画 | `.navigationTransition` + `matchedGeometryEffect` |
| 启动优化 | 精简 `ShopApp.init`，延迟非关键加载 |
| Kingfisher | 内存 150MB + 磁盘 300MB 缓存配置 |
| 触觉反馈 | `UIImpactFeedbackGenerator` 关键操作 |

**验收标准：**
- [ ] 个人中心未登录 → "Sign in" 引导
- [ ] 已登录 → 用户名 + 2x2 功能入口
- [ ] 最近 3 条订单展示
- [ ] Sign Out → 清 Keychain + 清状态 → 回首页
- [ ] `.refreshable` 下拉刷新全局生效
- [ ] `NWPathMonitor` 离线横幅
- [ ] 深色模式完整适配
- [ ] 转场动画流畅
- [ ] App 体积 < 20MB
- [ ] 冷启动 < 500ms

---

## Phase 依赖关系

```
Phase 1 (核心基础设施 + 主题)
  └→ Phase 2 (导航 + 认证)
       └→ Phase 3 (首页 + 共享组件)
            └→ Phase 4 (搜索 + 分类 + 商品列表)
                 └→ Phase 5 (商品详情 + 购物车)
                      └→ Phase 6 (订单 + 支付 + 地址)
                           └→ Phase 7 (个人中心 + 优化)
```

**Phase 内可并行：**
- Phase 4：搜索、分类菜单、商品列表可并行开发
- Phase 5：商品详情和购物车可并行开发
- Phase 6：地址管理与订单流程可并行开发

---

## Phase 合并映射（10 → 7）

| 新 Phase | 旧 Phase | 关键变化 |
|----------|----------|---------|
| **Phase 1**: 基础设施 | Phase 1 | + PaginationState, Toast, 双类型 PriceFormatter, struct APIClient, coalesced AuthManager |
| **Phase 2**: 导航 + 认证 | Phase 2 | 无变化 |
| **Phase 3**: 首页 + 共享组件 | Phase 3 | + 所有共享组件（SortBar, QuantityStepper 等）+ Product/Category 数据层 |
| **Phase 4**: 商品发现 | Phase 4 + 5 + 6a | 合并搜索 + 分类 + 商品列表，全部复用 ProductGrid/SortBar |
| **Phase 5**: 详情 + 购物车 | Phase 6b + 7 | 合并商品详情 + 购物车，浏览到购买漏斗 |
| **Phase 6**: 订单 + 支付 + 地址 | Phase 9 + 10a | 地址 CRUD 移入（下单依赖地址） |
| **Phase 7**: 个人中心 + 优化 | Phase 8 + 10b | 合并个人中心 + 全局优化 |

---

## iOS vs Android vs H5 三端对照

### 架构概念映射

| 概念 | H5 (React) | Android (Kotlin) | iOS (Swift) |
|------|-----------|-----------------|-------------|
| 状态管理 | Zustand store | ViewModel + MVI | TCA Feature (Reducer) |
| 状态定义 | store state | UiState | @ObservableState |
| 用户操作 | store action | Intent | Action |
| 副作用 | useEffect | viewModelScope.launch | Effect.run |
| 响应式流 | — | StateFlow | @ObservableState 自动 |
| 依赖注入 | 直接 import | Hilt @Inject | TCA @DependencyClient |
| 路由 | React Router | Navigation Compose | NavigationStack |
| 列表 | map + IntersectionObserver | LazyColumn + Paging 3 | List/LazyVGrid + PaginationState |
| 轮播 | touch event 手写 | HorizontalPager | TabView(.page) |
| 持久化 | localStorage | DataStore | Keychain / UserDefaults |
| 防抖 | setTimeout | Flow.debounce | clock.sleep + cancellable |
| 网络 | ky + hooks | OkHttp + Interceptor | URLSession + struct APIClient |
| 图片 | `<img loading="lazy">` | Coil | Kingfisher |
| Toast | toast 组件 | Snackbar | ToastManager + ToastView |
| 分页 | 手动分页 store | Paging 3 PagingSource | PaginationState<Item> |
| 价格 | PriceFormatter | PriceFormatter (String+Double) | PriceFormatter (String+Double) |

### 文件对照

| H5 | Android | iOS |
|----|---------|-----|
| `router.tsx` | `AppNavGraph.kt` | `MainTabView.swift` |
| `root-layout.tsx` | `MainScreen.kt` | `MainTabView.swift` |
| `stores/home.ts` | `HomeViewModel.kt` | `HomeFeature.swift` |
| `stores/cart.ts` | `CartViewModel.kt` | `CartFeature.swift` |
| `stores/category.ts` | `MenuViewModel.kt` | `MenuFeature.swift` |
| `components/product-card.tsx` | `ProductCard.kt` | `ProductCard.swift` |
| `components/product-grid.tsx` | `ProductGrid.kt` | `ProductGrid.swift` |
| `components/sort-bar.tsx` | `SortBar.kt` | `SortBar.swift` |
| `pages/home/index.tsx` | `HomeScreen.kt` | `HomeView.swift` |
| `pages/product/detail.tsx` | `ProductDetailScreen.kt` | `ProductDetailView.swift` |
| `pages/product/list.tsx` | `ProductListScreen.kt` | `ProductListView.swift` |
| `pages/product/search.tsx` | `SearchScreen.kt` | `SearchView.swift` |
| `pages/menu/index.tsx` | `MenuScreen.kt` | `MenuView.swift` |
| `pages/cart/index.tsx` | `CartScreen.kt` | `CartView.swift` |
| `pages/order/create.tsx` | `OrderCreateScreen.kt` | `OrderCreateView.swift` |
| `pages/order/list.tsx` | `OrderListScreen.kt` | `OrderListView.swift` |
| `pages/order/detail.tsx` | `OrderDetailScreen.kt` | `OrderDetailView.swift` |
| `pages/order/payment.tsx` | `PaymentScreen.kt` | `PaymentView.swift` |
| `pages/user/profile.tsx` | `ProfileScreen.kt` | `ProfileView.swift` |
| `pages/user/address.tsx` | `AddressScreen.kt` | `AddressView.swift` |
| `pages/auth/login.tsx` | `LoginScreen.kt` | `LoginView.swift` |
| `pages/auth/register.tsx` | `RegisterScreen.kt` | `RegisterView.swift` |
| `styles/globals.scss` | `ShopTheme.kt` | `ShopColors.swift` |

### Phase 进度对照

| Phase | 描述 | H5 | Android | iOS |
|-------|------|:--:|:-------:|:---:|
| 1 | 基础设施 | ✅ | ✅ | ⬜ |
| 2 | 导航 + 认证 | ✅ | ✅ | ⬜ |
| 3 | 首页 + 共享组件 | ✅ | ✅ | ⬜ |
| 4 | 商品发现（搜索+分类+列表） | ✅ | ✅ | ⬜ |
| 5 | 商品详情 + 购物车 | ✅ | ✅ | ⬜ |
| 6 | 订单 + 支付 + 地址 | ✅ | ✅ | ⬜ |
| 7 | 个人中心 + 优化 | ✅ | ✅ | ⬜ |

---

## iOS 特有优势

| 能力 | 说明 |
|------|------|
| **SwiftUI 动画** | `.matchedGeometryEffect` 共享元素转场 |
| **`.refreshable`** | 一行代码下拉刷新 |
| **`.searchable`** | 原生搜索栏集成 |
| **`.swipeActions`** | 原生滑动删除 |
| **`.confirmationDialog`** | 原生确认弹窗 |
| **`.sheet` / `.fullScreenCover`** | 原生模态页 |
| **`TimelineView`** | 支付倒计时精确渲染 |
| **`NWPathMonitor`** | 原生网络状态监听 |

---

## API 通信规则（iOS 端）

1. **全部 POST**，Body 为 JSON（与 H5 / Android 一致）
2. `AuthManager` (Actor) 自动注入 `Authorization: Bearer <token>`
3. 401 → coalesced refresh（复用 Task），失败则清 Keychain + 弹登录页
4. refresh 使用 `rawRequest` 避免 401 无限循环
5. 主动检查 `accessTokenExpiresAt`，60s 内过期提前刷新
6. 订单/支付自动附加 `X-Idempotency-Key`
7. 统一 `APIResponse<T>` Codable 解析，非 success 抛 `APIError`
8. `APIClient` 是 **struct Sendable**，`async let` 并发不被序列化

---

## 当前实现状态

| Phase | 描述 | 状态 |
|-------|------|------|
| Phase 1 | 核心基础设施 + 主题 | ⬜ 待实现 |
| Phase 2 | 导航框架 + 认证流程 | ⬜ 待实现 |
| Phase 3 | 首页 Home + 共享组件 | ⬜ 待实现 |
| Phase 4 | 商品发现（搜索 + 分类 + 列表） | ⬜ 待实现 |
| Phase 5 | 商品详情 + 购物车 | ⬜ 待实现 |
| Phase 6 | 订单 + 支付 + 地址 | ⬜ 待实现 |
| Phase 7 | 个人中心 + 全局优化 | ⬜ 待实现 |
