# iOS 原生实现计划（Amazon 级架构）

> 对标 H5 商城全部功能，使用现代 iOS 技术栈，Amazon 级别架构标准。

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
| DI | Swift 原生 + Environment | — | 轻量级，不引入重框架 |
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
> 如果偏好轻量方案，也可使用纯 SwiftUI + ObservableObject MVVM，文档结构不变。

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
    │   │   ├── APIClient.swift               # URLSession 封装，统一请求/响应
    │   │   ├── APIError.swift                # 统一异常，对标 @fe/api-client ApiError
    │   │   ├── APIResponse.swift             # { code, success, data, message, traceId }
    │   │   ├── AuthManager.swift             # Token 注入 + 401 自动刷新 + 登出
    │   │   ├── Endpoint.swift                # 路由定义（POST /api/v1/...）
    │   │   └── IdempotencyKey.swift          # 幂等 key 生成
    │   │
    │   ├── Storage/
    │   │   ├── KeychainStore.swift           # Keychain 封装（access/refresh token）
    │   │   ├── SearchHistoryStore.swift      # UserDefaults 搜索历史
    │   │   └── AppStorage+Extensions.swift   # @AppStorage 扩展
    │   │
    │   ├── Model/
    │   │   ├── PaginatedResult.swift         # 分页结构 { items, pagination }
    │   │   ├── Pagination.swift              # { page, pageSize, total, totalPages }
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
    │   │       ├── PageHeader.swift          # 导航顶栏
    │   │       ├── PriceText.swift           # 价格显示
    │   │       ├── QuantityStepper.swift      # 数量 +/- 步进器
    │   │       ├── RatingStars.swift         # 星级评分
    │   │       ├── SkeletonView.swift        # 骨架屏
    │   │       ├── EmptyStateView.swift      # 空状态
    │   │       └── LoadingButton.swift       # 带 loading 的按钮
    │   │
    │   ├── Util/
    │   │   ├── PriceFormatter.swift          # 金额格式化
    │   │   ├── DateFormatter+Shop.swift      # 日期格式化
    │   │   └── View+Extensions.swift         # View 扩展
    │   │
    │   └── DI/
    │       └── Dependencies.swift            # 依赖注册（TCA DependencyKey）
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
        │   ├── HomeFeature.swift             # TCA Reducer (State + Action + body)
        │   ├── Component/
        │   │   ├── BannerCarousel.swift       # TabView 自动轮播
        │   │   ├── CategoryPills.swift        # 横滑分类胶囊
        │   │   ├── DealSection.swift          # Deal of the Day
        │   │   ├── CategoryShowcase.swift     # 分类展示
        │   │   ├── NewArrivalsSection.swift   # 新品区
        │   │   └── TopRatedSection.swift      # 好评区
        │   └── Data/
        │       ├── HomeAPI.swift
        │       └── HomeClient.swift           # TCA DependencyClient
        │
        ├── Product/                          # 商品
        │   ├── List/
        │   │   ├── ProductListView.swift
        │   │   └── ProductListFeature.swift
        │   ├── Detail/
        │   │   ├── ProductDetailView.swift
        │   │   ├── ProductDetailFeature.swift
        │   │   └── Component/
        │   │       ├── ImageCarousel.swift     # TabView 图片轮播
        │   │       └── SkuSelector.swift       # SKU 属性选择
        │   ├── Search/
        │   │   ├── SearchView.swift
        │   │   └── SearchFeature.swift
        │   └── Data/
        │       ├── ProductAPI.swift
        │       ├── ProductClient.swift
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
        │       ├── CategoryClient.swift
        │       └── Model/
        │           └── Category.swift
        │
        ├── Cart/                             # 购物车
        │   ├── CartView.swift
        │   ├── CartFeature.swift
        │   └── Data/
        │       ├── CartAPI.swift
        │       ├── CartClient.swift
        │       └── Model/
        │           └── CartItem.swift
        │
        ├── Order/                            # 订单
        │   ├── Create/
        │   │   ├── OrderCreateView.swift
        │   │   └── OrderCreateFeature.swift
        │   ├── List/
        │   │   ├── OrderListView.swift
        │   │   └── OrderListFeature.swift
        │   ├── Detail/
        │   │   ├── OrderDetailView.swift
        │   │   └── OrderDetailFeature.swift
        │   ├── Payment/
        │   │   ├── PaymentView.swift
        │   │   └── PaymentFeature.swift
        │   └── Data/
        │       ├── OrderAPI.swift
        │       ├── OrderClient.swift
        │       ├── PaymentAPI.swift
        │       ├── PaymentClient.swift
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
        │       ├── UserClient.swift
        │       ├── AddressAPI.swift
        │       ├── AddressClient.swift
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
                ├── AuthClient.swift
                └── Model/
                    └── AuthToken.swift
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
        var items: [CartItem] = []
        var selectedIds: Set<String> = []
        var isLoading = false
        var totalPrice: Int = 0
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
        case cartLoaded(Result<[CartItem], APIError>)
        case updateCompleted(Result<Void, APIError>)

        // 防抖
        case debouncedUpdate(skuId: String, quantity: Int)
    }

    // 3. Dependencies — 对标 @fe/api-client
    @Dependency(\.cartClient) var cartClient
    @Dependency(\.continuousClock) var clock

    // 4. Reducer — 状态转换 + 副作用
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {

            case .onAppear:
                state.isLoading = true
                return .run { send in
                    let result = await Result {
                        try await cartClient.list()
                    }
                    await send(.cartLoaded(result.mapError { $0 as! APIError }))
                }

            case let .updateQuantity(skuId, quantity):
                // 乐观更新 — 先改 UI
                if let idx = state.items.firstIndex(where: { $0.skuId == skuId }) {
                    state.items[idx].quantity = quantity
                }
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

## 网络层设计

```swift
// ════════ APIClient — 对标 @fe/api-client 的 ky 封装 ════════

actor APIClient {
    private let baseURL: URL
    private let session: URLSession
    private let authManager: AuthManager

    // 统一请求方法 — 全部 POST + JSON Body
    func request<T: Decodable, P: Encodable>(
        _ endpoint: Endpoint,
        body: P,
        needsAuth: Bool = false
    ) async throws -> T {
        var request = URLRequest(url: baseURL.appending(path: endpoint.path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Token 注入
        if needsAuth {
            let token = try await authManager.validAccessToken()
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // 幂等 key（订单/支付）
        if endpoint.requiresIdempotency {
            request.setValue(
                IdempotencyKey.generate(),
                forHTTPHeaderField: "X-Idempotency-Key"
            )
        }

        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: request)

        // 401 自动刷新重试
        if (response as? HTTPURLResponse)?.statusCode == 401 && needsAuth {
            try await authManager.refreshToken()
            return try await self.request(endpoint, body: body, needsAuth: true)
        }

        let apiResponse = try JSONDecoder().decode(APIResponse<T>.self, from: data)

        guard apiResponse.success, let data = apiResponse.data else {
            throw APIError(
                code: apiResponse.code,
                errorCode: apiResponse.meta?.code,
                message: apiResponse.message
            )
        }

        return data
    }
}

// Endpoint 定义
enum Endpoint {
    case productList, productDetail, productSearch
    case categoryTree, categoryList
    case bannerList
    case cartList, cartAdd, cartUpdate, cartRemove, cartSelect, cartCheckoutPreview
    case orderCreate, orderList, orderDetail, orderCancel
    case paymentCreate, paymentQuery
    case authLogin, authRegister, authRefresh, authLogout
    case userProfile, userUpdate
    case addressList, addressCreate, addressUpdate, addressDelete

    var path: String {
        switch self {
        case .productList:          return "/api/v1/product/list"
        case .productDetail:        return "/api/v1/product/detail"
        case .productSearch:        return "/api/v1/product/search"
        case .categoryTree:         return "/api/v1/category/tree"
        case .cartList:             return "/api/v1/cart/list"
        case .cartAdd:              return "/api/v1/cart/add"
        case .orderCreate:          return "/api/v1/order/create"
        case .paymentCreate:        return "/api/v1/payment/create"
        // ... 其他路由
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

## Token 安全存储

```swift
// ════════ Keychain 存储 — 比 Android DataStore 更安全 ════════

actor KeychainStore {
    private let service = "com.example.shop"

    func save(token: AuthToken) throws {
        try set(token.accessToken, for: "accessToken")
        try set(token.refreshToken, for: "refreshToken")
        try set(token.accessTokenExpiresAt, for: "accessTokenExpiresAt")
    }

    func getAccessToken() throws -> String? {
        try get(for: "accessToken")
    }

    func clear() throws {
        try delete(for: "accessToken")
        try delete(for: "refreshToken")
        try delete(for: "accessTokenExpiresAt")
    }

    // MARK: - Keychain 底层操作
    private func set(_ value: String, for key: String) throws { /* ... */ }
    private func get(for key: String) throws -> String? { /* ... */ }
    private func delete(for key: String) throws { /* ... */ }
}
```

---

## 分阶段实现计划

共 10 个 Phase，每个 Phase 可独立验证。

---

### Phase 1 — 项目初始化 + 核心基础设施 `[ ]`

> 搭建项目骨架，所有后续 Phase 的地基。

**目标：** 项目能运行，网络能通，Token 能存取。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `Shop.xcodeproj` | Xcode 项目配置，iOS 17+ |
| `Package.swift` | SPM 依赖：TCA、Kingfisher |
| `ShopApp.swift` | `@main` App 入口 |
| `ContentView.swift` | 临时根视图 |
| `Core/Network/APIClient.swift` | URLSession 封装，统一 POST + JSON |
| `Core/Network/APIResponse.swift` | `{ code, success, data, message }` Codable |
| `Core/Network/APIError.swift` | 统一异常，支持 `err.is(.stockInsufficient)` |
| `Core/Network/AuthManager.swift` | Token 注入 + 401 刷新 + Actor 并发安全 |
| `Core/Network/Endpoint.swift` | 全部 API 路由枚举 |
| `Core/Network/IdempotencyKey.swift` | UUID 幂等 key 生成 |
| `Core/Storage/KeychainStore.swift` | Keychain 加密存储 token |
| `Core/Storage/SearchHistoryStore.swift` | UserDefaults 搜索历史 |
| `Core/Model/PaginatedResult.swift` | 分页响应 Codable |
| `Core/Model/ErrorCode.swift` | 业务错误码 |
| `Core/UI/Theme/ShopColors.swift` | Amazon 色系 Color 扩展 |
| `Core/UI/Theme/ShopFonts.swift` | 字体系统 |
| `Core/UI/Theme/ShopDimens.swift` | 尺寸规范 |
| `Core/DI/Dependencies.swift` | TCA DependencyKey 注册 |

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
}

// AuthManager.swift — Actor 保证并发安全
actor AuthManager {
    private let keychain: KeychainStore
    private let apiClient: () -> APIClient  // lazy 避免循环依赖
    private var isRefreshing = false

    func validAccessToken() async throws -> String {
        guard let token = try keychain.getAccessToken() else {
            throw APIError.unauthorized
        }
        return token
    }

    func refreshToken() async throws {
        guard !isRefreshing else { return }
        isRefreshing = true
        defer { isRefreshing = false }

        guard let refreshToken = try keychain.getRefreshToken() else {
            try keychain.clear()
            throw APIError.unauthorized
        }

        let result: AuthToken = try await apiClient()
            .request(.authRefresh, body: ["refreshToken": refreshToken])
        try keychain.save(token: result)
    }
}
```

**验收标准：**
- [ ] 项目编译通过，Xcode 运行空白页
- [ ] APIClient 能请求 `/api/v1/product/list` 并解析
- [ ] Token Keychain 存取正常
- [ ] TCA 依赖注入正常
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
| `Feature/Auth/Data/*` | AuthAPI + AuthClient |
| `Feature/Auth/Login/*` | LoginView + LoginFeature |
| `Feature/Auth/Register/*` | RegisterView + RegisterFeature |

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
    case productList(categoryId: String?)
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

            // ... 其他 Tab
        }
        .tint(.shopTeal)
    }
}
```

**底栏规格（对标 H5 / Android）：**
- 系统 TabView，tint 色 `#007185` (teal)
- SF Symbols 图标
- Cart Tab 右上角 `.badge(cartCount)`

**验收标准：**
- [ ] 4 Tab 切换，高亮正确
- [ ] 每个 Tab 独立 NavigationStack
- [ ] 登录/注册表单验证 + API 调用
- [ ] 登录成功 → 存 Keychain → 跳转首页
- [ ] 已登录访问登录页 → 重定向
- [ ] 未登录访问购物车 → 弹登录页

---

### Phase 3 — 首页 Home `[ ]`

> 用户看到的第一个页面，Amazon 风格多区块。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `Feature/Home/HomeView.swift` | ScrollView 多区块 |
| `Feature/Home/HomeFeature.swift` | TCA Reducer，并行加载数据 |
| `Feature/Home/Component/BannerCarousel.swift` | TabView + Timer 自动翻页 |
| `Feature/Home/Component/CategoryPills.swift` | ScrollView(.horizontal) 胶囊 |
| `Feature/Home/Component/DealSection.swift` | Deal of the Day 横滑 |
| `Feature/Home/Component/CategoryShowcase.swift` | 分类展示 |
| `Feature/Home/Component/NewArrivalsSection.swift` | 新品 |
| `Feature/Home/Component/TopRatedSection.swift` | 好评 |
| `Feature/Home/Data/*` | HomeAPI + HomeClient |
| `Core/UI/Component/ProductCard.swift` | 商品卡片 |
| `Core/UI/Component/ProductGrid.swift` | LazyVGrid 2 列 + 无限滚动 |
| `Core/UI/Component/PriceText.swift` | 价格组件 |
| `Core/UI/Component/RatingStars.swift` | 星级评分 |
| `Core/UI/Component/SkeletonView.swift` | 骨架屏 |

**页面结构（ScrollView）：**

```
┌─────────────────────────────────┐
│ [深色搜索栏] — .searchable 样式   │
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
│ LazyVGrid 2 列 + onAppear 触发   │
│ 下一页加载（无限滚动）             │
└─────────────────────────────────┘
```

**API 调用：**

| 区域 | API | 参数 |
|------|-----|------|
| 分类胶囊 | `POST /api/v1/category/tree` | `{}` |
| Banner | `POST /api/v1/banner/list` | `{}` |
| Deal of the Day | `POST /api/v1/product/list` | `sort: sales, order: desc, pageSize: 10` |
| New Arrivals | `POST /api/v1/product/list` | `sort: createdAt, order: desc, pageSize: 10` |
| Recommended | `POST /api/v1/product/list` | `sort: createdAt, order: desc` + 分页 |

**无限滚动实现：**

```swift
// ProductGrid.swift — onAppear 触发加载下一页
LazyVGrid(columns: columns, spacing: 12) {
    ForEach(products) { product in
        ProductCard(product: product)
            .onAppear {
                if product.id == products.last?.id {
                    store.send(.loadNextPage)
                }
            }
    }
    if isLoadingMore {
        ProgressView()
    }
}
```

**验收标准：**
- [ ] 搜索栏点击跳转搜索页
- [ ] 分类胶囊横滑，点击跳商品列表
- [ ] Banner 自动轮播 3 秒 + 手势滑动
- [ ] Deal 横滑展示热销商品
- [ ] 推荐区 2 列网格无限滚动
- [ ] 首次加载显示骨架屏
- [ ] 下拉刷新 `.refreshable`

---

### Phase 4 — 搜索页 Search `[ ]`

> 全屏搜索，历史 + 热词 + 结果。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `Feature/Product/Search/SearchView.swift` | 搜索 UI |
| `Feature/Product/Search/SearchFeature.swift` | TCA Reducer |
| `Core/Storage/SearchHistoryStore.swift` | 搜索历史持久化 |

**状态设计：**

```swift
@Reducer
struct SearchFeature {
    @ObservableState
    struct State: Equatable {
        var keyword = ""
        var phase: Phase = .initial

        enum Phase: Equatable {
            case initial(history: [String], hotKeywords: [String])
            case results(products: [Product], hasMore: Bool, isLoadingMore: Bool)
        }

        var sort: SearchSort = .relevance
        var page = 1
    }

    enum Action: BindableAction {
        case binding(BindingAction<State>)
        case onAppear
        case submitSearch
        case selectKeyword(String)
        case clearHistory
        case changeSort(SearchSort)
        case loadNextPage
        case searchResponse(Result<PaginatedResult<Product>, APIError>)
    }
}
```

**验收标准：**
- [ ] 输入框自动聚焦 `@FocusState`
- [ ] 搜索历史持久化，最多 10 条
- [ ] 点击历史/热词填入并搜索
- [ ] 清除历史
- [ ] 排序切换（综合/价格↑/价格↓/销量）
- [ ] 无限滚动分页

---

### Phase 5 — 分类页 Menu `[ ]`

> 左右分栏分类浏览。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `Feature/Menu/MenuView.swift` | HStack 左右分栏 |
| `Feature/Menu/MenuFeature.swift` | TCA Reducer |
| `Feature/Menu/Data/*` | CategoryAPI + CategoryClient |

**布局：**

```swift
HStack(spacing: 0) {
    // 左栏：一级分类
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

    // 右栏：二级分类
    ScrollView {
        LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 3)) {
            ForEach(store.subcategories) { sub in
                SubcategoryCard(category: sub)
                    .onTapGesture {
                        store.send(.navigateToProducts(categoryId: sub.id))
                    }
            }
        }
    }
}
```

**验收标准：**
- [ ] 左侧一级分类可切换
- [ ] 右侧显示对应二级分类
- [ ] 点击二级分类跳转商品列表
- [ ] 选中态：白色背景 + 左侧 3pt teal 竖条

---

### Phase 6 — 商品列表 & 详情 `[ ]`

> 浏览 → 决策的核心链路。

#### 6a. 商品列表

| 文件 | 说明 |
|------|------|
| `Feature/Product/List/ProductListView.swift` | 列表 UI |
| `Feature/Product/List/ProductListFeature.swift` | 排序 + 无限滚动 |

#### 6b. 商品详情

| 文件 | 说明 |
|------|------|
| `Feature/Product/Detail/ProductDetailView.swift` | 详情 UI |
| `Feature/Product/Detail/ProductDetailFeature.swift` | SKU 选择逻辑 |
| `Feature/Product/Detail/Component/ImageCarousel.swift` | TabView 图片轮播 |
| `Feature/Product/Detail/Component/SkuSelector.swift` | SKU 属性选择 |

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
│ ¥7,999                         │  PriceText
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

**SKU 选择逻辑（与 H5 / Android 一致）：**

```swift
// 从 skus[] 提取属性维度
// 例：["颜色": ["黑色","白色"], "内存": ["128GB","256GB","512GB"]]
// 用户选择后匹配唯一 SKU → 更新价格/库存
// stock == 0 的选项 → disabled 样式
```

**API：**
- `POST /api/v1/product/detail`
- `POST /api/v1/cart/add`

**验收标准：**
- [ ] 列表页排序切换
- [ ] 列表页无限滚动
- [ ] 详情页图片 TabView 轮播
- [ ] SKU 选择器联动价格/库存
- [ ] 库存为 0 禁用选项
- [ ] Add to Cart + toast 提示
- [ ] Buy Now → 直接下单
- [ ] 底部栏固定 `.safeAreaInset`

---

### Phase 7 — 购物车 Cart `[ ]`

> Tab 页面，完整购物车交互。

**文件：** `Feature/Cart/*`

**页面结构：**

```
┌─────────────────────────────────┐
│ Shopping Cart (3)               │  .navigationTitle
├─────────────────────────────────┤
│ ☑ ┌────┐ iPhone 15 Pro         │  List
│   │ img│ 256GB 原色钛金属       │
│   └────┘ ¥9,999       [- 1 +]  │
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

**核心逻辑（TCA 防抖）：**

```swift
case let .updateQuantity(skuId, quantity):
    // 乐观更新
    state.items[id: skuId]?.quantity = quantity
    state.recalculate()
    // 300ms 防抖
    return .run { send in
        try await clock.sleep(for: .milliseconds(300))
        await send(.debouncedUpdate(skuId: skuId, quantity: quantity))
    }
    .cancellable(id: CancelID.quantityUpdate(skuId), cancelInFlight: true)
```

**验收标准：**
- [ ] 未登录 → 空状态 + "Sign in"
- [ ] 列表正确渲染
- [ ] 勾选联动小计
- [ ] 数量乐观更新 + 300ms 防抖
- [ ] `.swipeActions` 左滑删除
- [ ] 全选/取消全选
- [ ] 结算跳转订单确认
- [ ] 底部栏固定

---

### Phase 8 — 个人中心 Profile `[ ]`

> Amazon "Your Account" 风格。

**文件：** `Feature/User/Profile/*`

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

**验收标准：**
- [ ] 未登录 → "Sign in" 引导
- [ ] 已登录 → 用户名 + 功能入口
- [ ] 最近 3 条订单
- [ ] Sign Out → 清 Keychain → 回首页

---

### Phase 9 — 订单全流程 `[ ]`

> 下单 → 支付 → 查看，完整闭环。

#### 9a. 订单确认页

**文件：** `Feature/Order/Create/*`

- 地址选择（`.sheet` 弹出地址列表）
- 商品清单 + 金额汇总
- "Place Order" → `POST /api/v1/order/create` + 幂等 key

#### 9b. 支付页

**文件：** `Feature/Order/Payment/*`

- 金额显示 + 支付方式选择
- 30 分钟倒计时（`TimelineView`）
- "Pay Now" → `POST /api/v1/payment/create` + 幂等 key
- 成功 → 跳转订单详情

#### 9c. 订单列表

**文件：** `Feature/Order/List/*`

- Tab 切换：All / Pending / Paid / Shipped / Delivered / Completed / Cancelled
- SwiftUI `Picker` segment 或自定义 ScrollableTabBar
- 无限滚动分页

#### 9d. 订单详情

**文件：** `Feature/Order/Detail/*`

- 状态 Banner
- 地址 + 商品 + 金额明细
- 操作按钮（取消/支付/确认收货）
- `.confirmationDialog` 取消确认

**验收标准：**
- [ ] 确认页展示地址 + 商品 + 金额
- [ ] 地址选择 Sheet
- [ ] 幂等 key 防重复
- [ ] 下单成功 → 支付页
- [ ] 支付倒计时
- [ ] 支付成功 → 订单详情
- [ ] 列表 Tab 筛选 + 分页
- [ ] 详情按状态显示操作
- [ ] 取消订单确认弹窗

---

### Phase 10 — 地址管理 + 收尾优化 `[ ]`

> 最后一个功能 + 全局打磨。

#### 10a. 地址管理

**文件：** `Feature/User/Address/*`

- 地址列表
- 新增/编辑（`.sheet` 表单）
- 设为默认 / 滑动删除

#### 10b. 全局优化

| 优化项 | iOS 实现 |
|--------|---------|
| 下拉刷新 | `.refreshable { }` |
| 网络异常 | `NWPathMonitor` 全局监听 + 提示 |
| 深色模式 | 自动适配 `@Environment(\.colorScheme)` |
| 安全区域 | SwiftUI 自动处理，无额外工作 |
| 转场动画 | `.navigationTransition` + `matchedGeometryEffect` |
| 启动优化 | 精简 `ShopApp.init`，延迟非关键加载 |
| Kingfisher 缓存 | 内存 150MB + 磁盘 300MB |
| Widget | 可选：锁屏小组件展示 Deal |

**验收标准：**
- [ ] 地址 CRUD 完整
- [ ] 下拉刷新全局生效
- [ ] 深色模式完整适配
- [ ] 转场动画流畅
- [ ] App 体积 < 20MB
- [ ] 冷启动 < 500ms

---

## Phase 依赖关系

```
Phase 1 (基础设施)
  └─→ Phase 2 (导航 + 认证)
        ├─→ Phase 3 (首页)
        │     ├─→ Phase 4 (搜索)
        │     └─→ Phase 5 (分类)
        ├─→ Phase 6 (商品列表 & 详情)
        │     └─→ Phase 7 (购物车)
        │           └─→ Phase 9 (订单全流程)
        │                 └─→ Phase 10 (地址 + 收尾)
        └─→ Phase 8 (个人中心)
```

**可并行：** 3/4/5 可并行，7/8 可并行。

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
| 依赖注入 | 直接 import | Hilt @Inject | TCA @Dependency |
| 路由 | React Router | Navigation Compose | NavigationStack |
| 列表 | map + IntersectionObserver | LazyColumn + Paging 3 | List/LazyVGrid + onAppear |
| 轮播 | touch event 手写 | HorizontalPager | TabView(.page) |
| 持久化 | localStorage | DataStore | Keychain / UserDefaults |
| 防抖 | setTimeout | Flow.debounce | clock.sleep + cancellable |
| 网络 | ky + hooks | OkHttp + Interceptor | URLSession + AuthManager |
| 图片 | `<img loading="lazy">` | Coil | Kingfisher |

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

---

## iOS 特有优势

| 能力 | 说明 |
|------|------|
| **SwiftUI 动画** | `.matchedGeometryEffect` 共享元素转场，比 Android 简单 |
| **`.refreshable`** | 一行代码下拉刷新，Android 需 PullToRefresh 组件 |
| **`.searchable`** | 原生搜索栏集成，自动处理键盘和取消 |
| **`.swipeActions`** | 原生滑动删除，Android 需自定义 |
| **`.confirmationDialog`** | 原生确认弹窗 |
| **`.sheet` / `.fullScreenCover`** | 原生模态页 |
| **Widget** | 锁屏小组件，展示 Deal / 订单状态 |
| **Live Activities** | 支付/配送实时追踪（灵动岛） |

---

## API 通信规则（iOS 端）

1. **全部 POST**，Body 为 JSON（与 H5 / Android 一致）
2. `AuthManager` (Actor) 自动注入 `Authorization: Bearer <token>`
3. 401 → 自动刷新 Token，失败则清 Keychain + 弹登录页
4. 订单/支付自动附加 `X-Idempotency-Key`
5. 统一 `APIResponse<T>` Codable 解析，非 success 抛 `APIError`
6. `APIClient` 是 Actor，天然线程安全（比 Android Mutex 更优雅）

---

## 当前实现状态

| Phase | 描述 | 状态 |
|-------|------|------|
| Phase 1 | 项目初始化 + 核心基础设施 | ⬜ 待实现 |
| Phase 2 | 导航框架 + 认证流程 | ⬜ 待实现 |
| Phase 3 | 首页 Home | ⬜ 待实现 |
| Phase 4 | 搜索页 Search | ⬜ 待实现 |
| Phase 5 | 分类页 Menu | ⬜ 待实现 |
| Phase 6 | 商品列表 & 详情 | ⬜ 待实现 |
| Phase 7 | 购物车 Cart | ⬜ 待实现 |
| Phase 8 | 个人中心 Profile | ⬜ 待实现 |
| Phase 9 | 订单全流程 | ⬜ 待实现 |
| Phase 10 | 地址管理 + 收尾优化 | ⬜ 待实现 |
