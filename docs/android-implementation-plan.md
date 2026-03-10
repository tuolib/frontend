# Android 原生实现计划（Amazon 级架构）

> 对标 H5 商城全部功能，使用现代 Android 技术栈，Amazon 级别架构标准。

---

## 技术栈

| 层级 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 语言 | Kotlin | 2.1+ | 100% Kotlin，零 Java |
| 最低 SDK | API 26 (Android 8.0) | — | 覆盖 95%+ 设备 |
| UI | Jetpack Compose | 1.7+ | 声明式 UI |
| 架构 | MVI | — | 单向数据流，对标 Zustand |
| 导航 | Navigation Compose | 2.8+ | `@Serializable` 类型安全路由 |
| 网络 | Retrofit + OkHttp | 2.11+ / 4.12+ | Token 拦截 + 刷新 |
| 序列化 | Kotlin Serialization | 1.7+ | 编译期 JSON 解析 |
| 异步 | Coroutines + Flow | 1.9+ | 响应式数据流 |
| DI | Hilt | 2.52+ | Google 官方依赖注入 |
| 图片 | Coil 3 | 3.0+ | Compose 原生支持 |
| 分页 | Paging 3 Compose | 3.3+ | 无限滚动 |
| 本地存储 | DataStore | 1.1+ | 替代 SharedPreferences |
| 构建 | Gradle + KTS | 8.x | Version Catalog 管理依赖 |

---

## 设计 Token（与 H5 保持一致）

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

> 每个文件标注首次创建的 Phase。已存在的文件标注 `[P1✅]`。

```
apps/android/
├── build.gradle.kts                          # [P1✅] 根构建配置
├── settings.gradle.kts                       # [P1✅]
├── gradle/
│   └── libs.versions.toml                    # [P1✅] Version Catalog
│
└── app/
    ├── build.gradle.kts                      # [P1✅]
    └── src/main/
        ├── AndroidManifest.xml               # [P1✅]
        └── java/com/example/shop/
            │
            ├── ShopApp.kt                    # [P1✅] Application + @HiltAndroidApp
            ├── MainActivity.kt               # [P1✅] 单 Activity 入口
            │
            ├── core/                         # ════════ 核心基础层 ════════
            │   │
            │   ├── network/
            │   │   ├── ApiResponseExt.kt     # [P1✅] ApiResponse<T>.unwrap() 扩展
            │   │   ├── ApiError.kt           # [P1✅] 统一异常，对标 @fe/api-client
            │   │   ├── AuthInterceptor.kt    # [P1✅] 请求注入 Bearer token
            │   │   ├── TokenAuthenticator.kt # [P1✅] 401 自动刷新 token
            │   │   └── IdempotencyInterceptor.kt  # [P6] 订单/支付幂等 key 注入
            │   │
            │   ├── storage/
            │   │   ├── TokenStore.kt         # [P1✅] DataStore 存储 token + 过期时间
            │   │   └── SearchHistoryStore.kt # [P4] DataStore 存储搜索历史
            │   │
            │   ├── model/
            │   │   ├── ApiResponse.kt        # [P1✅] 通用响应 { code, success, data }
            │   │   ├── PaginatedResult.kt    # [P1✅] 分页结构 { items, pagination }
            │   │   └── ErrorCode.kt          # [P1✅] 业务错误码常量
            │   │
            │   ├── ui/
            │   │   ├── theme/
            │   │   │   ├── ShopTheme.kt      # [P1✅] Material3 主题 + Amazon 色系
            │   │   │   ├── Color.kt          # [P1✅] 色值定义
            │   │   │   ├── Typography.kt     # [P1✅] 字体系统
            │   │   │   └── Dimens.kt         # [P1✅] 尺寸规范
            │   │   │
            │   │   └── component/            # 跨 feature 复用组件
            │   │       ├── ProductCard.kt    # [P3] 商品卡片
            │   │       ├── ProductGrid.kt    # [P3] 2 列商品网格 + Paging 3
            │   │       ├── PriceText.kt      # [P3] 价格显示（¥大字+小数+划线价）
            │   │       ├── RatingBar.kt      # [P3] 星级评分条
            │   │       ├── SkeletonLoader.kt # [P3] 骨架屏加载占位
            │   │       ├── EmptyState.kt     # [P3] 空状态提示
            │   │       ├── LoadingButton.kt  # [P2] 带 loading 状态的按钮
            │   │       ├── SortBar.kt        # [P4] 排序切换栏
            │   │       ├── PageHeader.kt     # [P5] 页面顶栏
            │   │       └── QuantityStepper.kt# [P5] 数量 +/- 步进器
            │   │
            │   ├── util/
            │   │   ├── PriceFormatter.kt     # [P1✅] 金额格式化（字符串/数值 → 显示）
            │   │   ├── DateFormatter.kt      # [P6] 日期时间格式化
            │   │   └── Extensions.kt         # [P2] 通用扩展函数
            │   │
            │   └── di/
            │       ├── NetworkModule.kt      # [P1✅] 提供 Retrofit / OkHttpClient
            │       ├── StorageModule.kt      # [P1✅] 提供 DataStore
            │       └── RepositoryModule.kt   # [P2] 提供各 Repository 绑定
            │
            ├── navigation/                   # ════════ 全局导航 [P2] ════════
            │   ├── Route.kt                  # @Serializable 类型安全路由
            │   ├── AppNavGraph.kt            # NavHost 路由表
            │   ├── BottomNavBar.kt           # 底部 4-Tab 导航
            │   └── MainScreen.kt             # Scaffold 骨架（顶栏+内容+底栏）
            │
            └── feature/                      # ════════ 业务功能层 ════════
                │
                ├── auth/                     # [P2] 认证
                │   ├── login/
                │   │   ├── LoginScreen.kt
                │   │   └── LoginViewModel.kt
                │   ├── register/
                │   │   ├── RegisterScreen.kt
                │   │   └── RegisterViewModel.kt
                │   └── data/
                │       ├── AuthApi.kt
                │       ├── AuthRepository.kt
                │       └── model/
                │           ├── AuthRequest.kt    # Login/Register/Refresh/Logout 请求
                │           ├── AuthResponse.kt   # AuthResponse / RefreshResponse
                │           └── User.kt           # 用户数据模型
                │
                ├── home/                     # [P3] 首页
                │   ├── HomeScreen.kt
                │   ├── HomeViewModel.kt
                │   ├── component/
                │   │   ├── BannerCarousel.kt
                │   │   ├── CategoryPills.kt
                │   │   ├── DealSection.kt
                │   │   ├── CategoryShowcase.kt
                │   │   ├── NewArrivalsSection.kt
                │   │   └── TopRatedSection.kt
                │   └── data/
                │       ├── HomeApi.kt
                │       ├── HomeRepository.kt
                │       └── model/
                │           └── Banner.kt
                │
                ├── product/                  # [P4/P5] 商品
                │   ├── list/                 # [P4]
                │   │   ├── ProductListScreen.kt
                │   │   ├── ProductListViewModel.kt
                │   │   └── ProductPagingSource.kt
                │   ├── search/               # [P4]
                │   │   ├── SearchScreen.kt
                │   │   └── SearchViewModel.kt
                │   ├── detail/               # [P5]
                │   │   ├── ProductDetailScreen.kt
                │   │   ├── ProductDetailViewModel.kt
                │   │   └── component/
                │   │       ├── ImageCarousel.kt
                │   │       └── SkuSelector.kt
                │   └── data/
                │       ├── ProductApi.kt     # [P3] 首页复用
                │       ├── ProductRepository.kt  # [P3]
                │       └── model/
                │           ├── Product.kt        # [P3] ProductListItem
                │           ├── ProductDetail.kt  # [P5]
                │           ├── Sku.kt            # [P5]
                │           └── SearchRequest.kt  # [P4]
                │
                ├── menu/                     # [P4] 分类菜单
                │   ├── MenuScreen.kt
                │   ├── MenuViewModel.kt
                │   └── data/
                │       ├── CategoryApi.kt
                │       ├── CategoryRepository.kt
                │       └── model/
                │           └── Category.kt
                │
                ├── cart/                     # [P5] 购物车
                │   ├── CartScreen.kt
                │   ├── CartViewModel.kt
                │   └── data/
                │       ├── CartApi.kt
                │       ├── CartRepository.kt
                │       └── model/
                │           ├── CartItem.kt
                │           └── CheckoutPreview.kt
                │
                ├── order/                    # [P6] 订单 + 支付
                │   ├── create/
                │   │   ├── OrderCreateScreen.kt
                │   │   └── OrderCreateViewModel.kt
                │   ├── list/
                │   │   ├── OrderListScreen.kt
                │   │   ├── OrderListViewModel.kt
                │   │   └── OrderPagingSource.kt
                │   ├── detail/
                │   │   ├── OrderDetailScreen.kt
                │   │   └── OrderDetailViewModel.kt
                │   ├── payment/
                │   │   ├── PaymentScreen.kt
                │   │   └── PaymentViewModel.kt
                │   └── data/
                │       ├── OrderApi.kt
                │       ├── OrderRepository.kt
                │       ├── PaymentApi.kt
                │       ├── PaymentRepository.kt
                │       └── model/
                │           ├── Order.kt
                │           ├── OrderItem.kt
                │           └── Payment.kt
                │
                └── user/                     # [P6/P7] 用户
                    ├── address/              # [P6]
                    │   ├── AddressScreen.kt
                    │   └── AddressViewModel.kt
                    ├── profile/              # [P7]
                    │   ├── ProfileScreen.kt
                    │   └── ProfileViewModel.kt
                    └── data/
                        ├── UserApi.kt        # [P7]
                        ├── UserRepository.kt # [P7]
                        ├── AddressApi.kt     # [P6]
                        ├── AddressRepository.kt  # [P6]
                        └── model/
                            ├── User.kt       # 复用 auth/data/model/User.kt
                            └── Address.kt    # [P6]
```

---

## 架构模式

### MVI 单向数据流

所有 ViewModel 遵循统一模式：

```kotlin
// UiState — 描述 UI 当前状态
data class XxxUiState(
    val isLoading: Boolean = false,
    val data: T? = null,
    val error: String? = null,
)

// ViewModel — 持有状态 + 处理事件
@HiltViewModel
class XxxViewModel @Inject constructor(
    private val repository: XxxRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(XxxUiState())
    val state: StateFlow<XxxUiState> = _state.asStateFlow()

    // 单次事件（Snackbar / 导航）
    private val _event = Channel<XxxEvent>()
    val event = _event.receiveAsFlow()

    fun onAction(action: XxxAction) { ... }
}
```

### 错误处理流程

```
API 请求
  ↓
Retrofit → ApiResponse<T>
  ↓
ApiResponseExt.unwrap() → 成功返回 T / 失败抛 ApiError
  ↓
Repository 层 → Result<T> 包装（或直接抛出让 ViewModel 捕获）
  ↓
ViewModel 层 → catch ApiError → 更新 UiState.error 或发送 Event
  ↓
UI 层 → Snackbar / Dialog / 内联错误提示
  ↓
401 特殊处理 → TokenAuthenticator 自动刷新 → 失败清 Token → 跳登录
```

### Paging 3 数据源模式

```kotlin
class XxxPagingSource(
    private val api: XxxApi,
    private val params: RequestParams,
) : PagingSource<Int, Item>() {

    override fun getRefreshKey(state: PagingState<Int, Item>): Int? {
        return state.anchorPosition?.let { pos ->
            state.closestPageToPosition(pos)?.let {
                it.prevKey?.plus(1) ?: it.nextKey?.minus(1)
            }
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Item> {
        val page = params.key ?: 1
        return try {
            val response = api.list(request.copy(page = page)).unwrap()
            LoadResult.Page(
                data = response.items,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (page >= response.pagination.totalPages) null else page + 1,
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
}
```

---

## 分阶段实现计划

共 7 个 Phase，每个 Phase 可独立验证。

---

### Phase 1 — 项目初始化 + 核心基础设施 ✅ 已完成

> 搭建项目骨架，所有后续 Phase 的地基。

**目标：** 项目能运行，网络能通，Token 能存取。

**已创建文件：**

| 文件 | 说明 |
|------|------|
| `build.gradle.kts` (root) | Gradle 配置，Hilt/Compose/Serialization plugin |
| `app/build.gradle.kts` | 依赖声明，`API_BASE_URL` 通过 BuildConfig 注入 |
| `gradle/libs.versions.toml` | Version Catalog 集中管理版本 |
| `ShopApp.kt` | `@HiltAndroidApp` Application |
| `MainActivity.kt` | `@AndroidEntryPoint` 单 Activity + `setContent { ShopTheme {} }` |
| `core/ui/theme/Color.kt` | Amazon 色系 Light/Dark Material3 ColorScheme |
| `core/ui/theme/ShopTheme.kt` | Material3 主题包装 |
| `core/ui/theme/Typography.kt` | 字体系统 |
| `core/ui/theme/Dimens.kt` | 间距/圆角/组件尺寸常量 |
| `core/model/ApiResponse.kt` | `ApiResponse<T>` + `ErrorMeta` |
| `core/model/PaginatedResult.kt` | `PaginatedResult<T>` + `Pagination` |
| `core/model/ErrorCode.kt` | 21 个业务错误码常量 |
| `core/network/ApiClient.kt` | `ApiResponse<T>.unwrap()` 扩展函数 |
| `core/network/ApiError.kt` | `ApiError(code, errorCode, message)` + `is()` 匹配 |
| `core/network/AuthInterceptor.kt` | OkHttp Interceptor，注入 `Authorization: Bearer` |
| `core/network/TokenAuthenticator.kt` | 401 自动刷新，Mutex 防并发 |
| `core/storage/TokenStore.kt` | DataStore 存储 accessToken / refreshToken |
| `core/util/PriceFormatter.kt` | 金额格式化 |
| `core/di/NetworkModule.kt` | Hilt 提供 Json / OkHttpClient / Retrofit |
| `core/di/StorageModule.kt` | Hilt 提供 DataStore |

**已知 Bug（Phase 2 修复）：**

| Bug | 现状 | 正确行为 |
|-----|------|---------|
| **PriceFormatter 单位错误** | 接收 `Long priceInCents`，除以 100。`format(799900)` → `"7,999.00"` | API 返回字符串元价格（如 `"7999.00"`）和数值元价格（如 `7999.0`），不存在"分"。应改为 `format(price: String)` 和 `format(price: Double)` |
| **TokenStore 缺少过期时间** | 只存 `accessToken` + `refreshToken` | API 返回 `accessTokenExpiresAt` + `refreshTokenExpiresAt`（ISO 8601），应一并存储以支持主动刷新 |
| **ApiClient.kt 文件名误导** | 文件名暗示是 HTTP 客户端配置，实际只是 `unwrap()` 扩展 | 重命名为 `ApiResponseExt.kt` |
| **TokenAuthenticator 丢弃过期时间** | `RefreshTokenResponse` 包含 `accessTokenExpiresAt` 和 `refreshTokenExpiresAt`，但 `saveTokens()` 只存 token 值 | 修改 `saveTokens()` 同时存储过期时间 |

---

### Phase 2 — 导航框架 + 认证流程 + Phase 1 修复 ✅ 已完成

> 搭建全局导航骨架，完成登录/注册闭环，修复 Phase 1 已知 Bug。

**Phase 1 Bug 修复：**

```kotlin
// ═══════════════════════════════════════════════
// 修复 1: PriceFormatter.kt — 去掉 cents 概念
// ═══════════════════════════════════════════════
object PriceFormatter {
    private val formatter = DecimalFormat("#,##0.00")

    /** 格式化字符串价格。"7999.00" → "7,999.00" */
    fun format(price: String): String {
        return try {
            formatter.format(price.toBigDecimal())
        } catch (_: Exception) {
            price
        }
    }

    /** 格式化数值价格。7999.0 → "7,999.00" */
    fun format(price: Double): String {
        return formatter.format(price)
    }

    /** 带 ¥ 符号。"7999.00" → "¥7,999.00" */
    fun formatWithSymbol(price: String): String = "¥${format(price)}"

    /** 带 ¥ 符号。7999.0 → "¥7,999.00" */
    fun formatWithSymbol(price: Double): String = "¥${format(price)}"
}

// ═══════════════════════════════════════════════
// 修复 2: TokenStore.kt — 增加过期时间
// ═══════════════════════════════════════════════
@Singleton
class TokenStore @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) {
    val accessToken: Flow<String?> = dataStore.data.map { it[ACCESS_TOKEN_KEY] }
    val refreshToken: Flow<String?> = dataStore.data.map { it[REFRESH_TOKEN_KEY] }
    val isLoggedIn: Flow<Boolean> = dataStore.data.map { it[ACCESS_TOKEN_KEY] != null }
    val accessTokenExpiresAt: Flow<String?> = dataStore.data.map { it[ACCESS_EXPIRES_KEY] }
    val refreshTokenExpiresAt: Flow<String?> = dataStore.data.map { it[REFRESH_EXPIRES_KEY] }

    suspend fun saveTokens(
        accessToken: String,
        refreshToken: String,
        accessTokenExpiresAt: String? = null,
        refreshTokenExpiresAt: String? = null,
    ) {
        dataStore.edit { prefs ->
            prefs[ACCESS_TOKEN_KEY] = accessToken
            prefs[REFRESH_TOKEN_KEY] = refreshToken
            accessTokenExpiresAt?.let { prefs[ACCESS_EXPIRES_KEY] = it }
            refreshTokenExpiresAt?.let { prefs[REFRESH_EXPIRES_KEY] = it }
        }
    }

    /** Token 是否即将过期（60s 内） */
    suspend fun isAccessTokenExpiringSoon(): Boolean {
        val expiresAt = dataStore.data.first()[ACCESS_EXPIRES_KEY] ?: return false
        return try {
            val expiryInstant = Instant.parse(expiresAt)
            Instant.now().plusSeconds(60).isAfter(expiryInstant)
        } catch (_: Exception) { false }
    }

    suspend fun clear() {
        dataStore.edit { it.clear() }
    }

    companion object {
        private val ACCESS_TOKEN_KEY = stringPreferencesKey("access_token")
        private val REFRESH_TOKEN_KEY = stringPreferencesKey("refresh_token")
        private val ACCESS_EXPIRES_KEY = stringPreferencesKey("access_token_expires_at")
        private val REFRESH_EXPIRES_KEY = stringPreferencesKey("refresh_token_expires_at")
    }
}

// ═══════════════════════════════════════════════
// 修复 3: 重命名 ApiClient.kt → ApiResponseExt.kt
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// 修复 4: TokenAuthenticator — 存储过期时间
// ═══════════════════════════════════════════════
// performRefresh() 中调用:
// tokenStore.saveTokens(
//     result.accessToken, result.refreshToken,
//     result.accessTokenExpiresAt, result.refreshTokenExpiresAt,
// )
```

**新增文件：**

| 文件 | 说明 |
|------|------|
| `core/network/ApiResponseExt.kt` | 重命名自 `ApiClient.kt`，增加 `requireSuccess()` |
| `core/util/Extensions.kt` | 通用扩展函数 |
| `core/di/RepositoryModule.kt` | Hilt 提供各 Repository 绑定 |
| `navigation/Route.kt` | `@Serializable` 类型安全路由定义 |
| `navigation/AppNavGraph.kt` | NavHost 路由表 |
| `navigation/BottomNavBar.kt` | 4-Tab 底栏（Home/You/Cart/Menu） |
| `navigation/MainScreen.kt` | Scaffold + 条件显示底栏 |
| `feature/auth/data/model/AuthRequest.kt` | 登录/注册/刷新/登出请求模型 |
| `feature/auth/data/model/AuthResponse.kt` | 认证响应模型 |
| `feature/auth/data/model/User.kt` | 用户数据模型 |
| `feature/auth/data/AuthApi.kt` | Retrofit 认证接口 |
| `feature/auth/data/AuthRepository.kt` | 认证业务逻辑 |
| `feature/auth/login/LoginScreen.kt` | 登录页 UI |
| `feature/auth/login/LoginViewModel.kt` | 登录逻辑 |
| `feature/auth/register/RegisterScreen.kt` | 注册页 UI |
| `feature/auth/register/RegisterViewModel.kt` | 注册逻辑 |
| `core/ui/component/LoadingButton.kt` | 带 loading 状态按钮 |

**路由定义（类型安全）：**

```kotlin
// navigation/Route.kt
import kotlinx.serialization.Serializable

// ── Tab 页面（显示底栏）──
@Serializable data object HomeRoute
@Serializable data object ProfileRoute
@Serializable data object CartRoute
@Serializable data object MenuRoute

// ── 独立页面（隐藏底栏）──
@Serializable data object SearchRoute
@Serializable data class ProductListRoute(
    val categoryId: String? = null,
    val categoryName: String? = null,
)
@Serializable data class ProductDetailRoute(val productId: String)
@Serializable data object OrderCreateRoute
@Serializable data object OrderListRoute
@Serializable data class OrderDetailRoute(val orderId: String)
@Serializable data class PaymentRoute(val orderId: String)
@Serializable data object AddressManageRoute

// ── 认证页面（Guest Only）──
@Serializable data object LoginRoute
@Serializable data object RegisterRoute
```

**数据模型：**

```kotlin
// feature/auth/data/model/AuthRequest.kt
@Serializable data class LoginRequest(val email: String, val password: String)
@Serializable data class RegisterRequest(
    val email: String,
    val password: String,
    val nickname: String? = null,
)
@Serializable data class RefreshRequest(val refreshToken: String)
@Serializable data class LogoutRequest(val refreshToken: String? = null)

// feature/auth/data/model/AuthResponse.kt
@Serializable
data class AuthResponse(
    val user: User,
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresAt: String,   // ISO 8601
    val refreshTokenExpiresAt: String,
)

@Serializable
data class RefreshResponse(
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresAt: String,
    val refreshTokenExpiresAt: String,
)

// feature/auth/data/model/User.kt
@Serializable
data class User(
    val id: String,
    val email: String,
    val nickname: String? = null,
    val avatarUrl: String? = null,
    val phone: String? = null,
    val status: String,
    val lastLogin: String? = null,
    val createdAt: String,
    val updatedAt: String,
)
```

**Retrofit 接口：**

```kotlin
// feature/auth/data/AuthApi.kt
interface AuthApi {
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<AuthResponse>

    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<AuthResponse>

    @POST("api/v1/auth/logout")
    suspend fun logout(@Body request: LogoutRequest): ApiResponse<JsonElement?>
}
```

**底栏规格（对标 H5）：**
- 高度：56dp，白色背景，顶部 1dp `#DDD` 分割线
- 图标：24dp，Material Icons
- 文字：12sp
- 选中色：`#007185`（teal），未选中：`#565959`
- Cart Tab 右上角 Badge（橙色圆点 + 数量）

**ApiResponseExt 扩展：**

```kotlin
// core/network/ApiResponseExt.kt
fun <T> ApiResponse<T>.unwrap(): T {
    if (!success || data == null) {
        throw ApiError(code, meta?.code, message.ifEmpty { "Request failed" })
    }
    return data
}

/** 用于无返回数据的接口（logout / cart/update 等） */
fun <T> ApiResponse<T>.requireSuccess() {
    if (!success) {
        throw ApiError(code, meta?.code, message.ifEmpty { "Request failed" })
    }
}
```

**验收标准：**
- [ ] Phase 1 所有 Bug 已修复
- [ ] PriceFormatter 正确解析字符串价格 `"7999.00"` → `"¥7,999.00"`
- [ ] TokenStore 存储并可读取 `accessTokenExpiresAt`
- [ ] 4 个 Tab 可切换，底栏高亮正确
- [ ] Tab 页面显示底栏，其他页面隐藏
- [ ] 登录表单验证（邮箱格式 + 密码 8+ 位）+ API 调用
- [ ] 注册表单验证 + API 调用
- [ ] 登录/注册成功 → 保存 Token（含过期时间）→ 跳转首页
- [ ] 已登录用户访问登录页 → 重定向首页
- [ ] 未登录访问购物车 → 重定向登录页

---

### Phase 3 — 首页 Home + 共享组件 ✅ 已完成

> 用户看到的第一个页面，Amazon 风格多区块首页 + 跨功能共享 UI 组件。

**新增文件：**

| 文件 | 说明 |
|------|------|
| `core/ui/component/ProductCard.kt` | 商品卡片（图片+标题+价格+评分） |
| `core/ui/component/ProductGrid.kt` | 2 列网格 + Paging 3 无限滚动 |
| `core/ui/component/PriceText.kt` | 价格显示（¥大字+小数+划线价） |
| `core/ui/component/RatingBar.kt` | 星级评分条 |
| `core/ui/component/SkeletonLoader.kt` | 骨架屏加载占位 |
| `core/ui/component/EmptyState.kt` | 空状态提示 |
| `feature/home/HomeScreen.kt` | 首页主体，LazyColumn 多区块 |
| `feature/home/HomeViewModel.kt` | 并行加载分类/Banner/Deal/推荐 |
| `feature/home/component/BannerCarousel.kt` | HorizontalPager + 自动翻页 3s |
| `feature/home/component/CategoryPills.kt` | LazyRow 分类胶囊 |
| `feature/home/component/DealSection.kt` | Deal of the Day 横滑 |
| `feature/home/component/CategoryShowcase.kt` | 分类推荐 2x2 卡片 |
| `feature/home/component/NewArrivalsSection.kt` | 新品横滑 |
| `feature/home/component/TopRatedSection.kt` | 好评横滑 |
| `feature/home/data/HomeApi.kt` | Banner API |
| `feature/home/data/HomeRepository.kt` | 首页数据聚合 |
| `feature/home/data/model/Banner.kt` | Banner 数据模型 |
| `feature/product/data/ProductApi.kt` | 商品列表 API（首页复用） |
| `feature/product/data/ProductRepository.kt` | 商品数据层 |
| `feature/product/data/model/Product.kt` | 商品列表项模型 |
| `feature/menu/data/CategoryApi.kt` | 分类 API（首页复用） |
| `feature/menu/data/CategoryRepository.kt` | 分类数据层 |
| `feature/menu/data/model/Category.kt` | 分类树模型 |

**数据模型：**

```kotlin
// feature/home/data/model/Banner.kt
@Serializable
data class Banner(
    val id: String,
    val title: String,
    val subtitle: String? = null,
    val imageUrl: String,
    val linkType: String,         // "product" | "category"
    val linkValue: String? = null,
    val sortOrder: Int,
    val isActive: Boolean,
    val startAt: String? = null,
    val endAt: String? = null,
    val createdAt: String,
    val updatedAt: String,
)

// feature/product/data/model/Product.kt
@Serializable
data class ProductListRequest(
    val page: Int = 1,
    val pageSize: Int = 20,
    val sort: String = "createdAt",
    val order: String = "desc",
    val filters: ProductFilters? = null,
)

@Serializable
data class ProductFilters(
    val status: String? = null,
    val categoryId: String? = null,
    val brand: String? = null,
)

@Serializable
data class ProductListItem(
    val id: String,
    val title: String,
    val slug: String,
    val brand: String? = null,
    val status: String,
    val minPrice: String? = null,   // 字符串元价格，如 "7999.00"
    val maxPrice: String? = null,
    val totalSales: Int,
    val avgRating: String,          // 如 "4.5"
    val reviewCount: Int,
    val primaryImage: String? = null,
    val createdAt: String,
)

// feature/menu/data/model/Category.kt
@Serializable
data class CategoryNode(
    val id: String,
    val name: String,
    val slug: String,
    val iconUrl: String? = null,
    val sortOrder: Int,
    val isActive: Boolean,
    val children: List<CategoryNode> = emptyList(),
)
```

**Retrofit 接口：**

```kotlin
// feature/home/data/HomeApi.kt
interface HomeApi {
    @POST("api/v1/banner/list")
    suspend fun getBanners(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<Banner>>
}

// feature/product/data/ProductApi.kt
interface ProductApi {
    @POST("api/v1/product/list")
    suspend fun list(@Body request: ProductListRequest): ApiResponse<PaginatedResult<ProductListItem>>

    @POST("api/v1/product/detail")
    suspend fun detail(@Body request: ProductDetailRequest): ApiResponse<ProductDetail>

    @POST("api/v1/product/search")
    suspend fun search(@Body request: SearchRequest): ApiResponse<PaginatedResult<ProductListItem>>
}

// feature/menu/data/CategoryApi.kt
interface CategoryApi {
    @POST("api/v1/category/tree")
    suspend fun tree(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<CategoryNode>>
}
```

**页面结构（LazyColumn）：**

```
┌─────────────────────────────────┐
│ [深色搜索栏 — 点击跳转搜索页]     │
│ 📍 Deliver to Alice — Shanghai  │
├─────────────────────────────────┤
│ [分类横滑胶囊] LazyRow           │
├─────────────────────────────────┤
│ [Banner 轮播] HorizontalPager   │
│   3 秒自动切换 + 手势滑动         │
│   底部圆点指示器                  │
├─────────────────────────────────┤
│ Deal of the Day                 │
│ [横滑商品卡片] LazyRow           │
├─────────────────────────────────┤
│ [分类展示] 2x2 卡片网格          │
├─────────────────────────────────┤
│ New Arrivals                    │
│ [横滑卡片] LazyRow               │
├─────────────────────────────────┤
│ Top Rated                       │
│ [横滑卡片] LazyRow               │
├─────────────────────────────────┤
│ Recommended for You             │
│ [2 列网格] LazyVerticalGrid     │
│ Paging 3 无限滚动               │
└─────────────────────────────────┘
```

**API 调用映射：**

| 区域 | API | 参数 |
|------|-----|------|
| 分类胶囊 | `POST /api/v1/category/tree` | `{}` |
| Banner | `POST /api/v1/banner/list` | `{}` |
| Deal of the Day | `POST /api/v1/product/list` | `sort: "sales", order: "desc", pageSize: 10` |
| New Arrivals | `POST /api/v1/product/list` | `sort: "createdAt", order: "desc", pageSize: 10` |
| Top Rated | `POST /api/v1/product/list` | `sort: "createdAt", order: "desc", pageSize: 10` |
| Recommended | `POST /api/v1/product/list` | `sort: "createdAt", order: "desc"` + Paging |

**验收标准：**
- [ ] 搜索栏点击跳转搜索页
- [ ] 分类胶囊横滑，点击跳转商品列表（传 categoryId + categoryName）
- [ ] Banner 自动轮播 3 秒 + 手势滑动 + 圆点指示器
- [ ] Deal / New Arrivals / Top Rated 横滑商品卡片
- [ ] 推荐区 2 列网格 Paging 3 无限滚动
- [ ] 首次加载显示骨架屏
- [ ] 下拉刷新（PullToRefresh）
- [ ] ProductCard 正确显示图片、标题、价格（PriceText）、评分（RatingBar）
- [ ] 点击商品卡片跳转商品详情页

---

### Phase 4 — 搜索 + 分类菜单 + 商品列表（浏览页面） ✅ 已完成

> 所有浏览类页面：搜索、分类菜单、商品列表。共享排序栏和分页逻辑。

**新增文件：**

| 文件 | 说明 |
|------|------|
| `core/storage/SearchHistoryStore.kt` | DataStore 持久化搜索历史（最多 10 条） |
| `core/ui/component/SortBar.kt` | 排序切换栏（综合/价格↑/价格↓/销量） |
| `feature/product/search/SearchScreen.kt` | 搜索页 UI |
| `feature/product/search/SearchViewModel.kt` | 搜索逻辑 + 历史管理 |
| `feature/product/list/ProductListScreen.kt` | 商品列表页 |
| `feature/product/list/ProductListViewModel.kt` | 排序 + 分页 |
| `feature/product/list/ProductPagingSource.kt` | Paging 3 数据源 |
| `feature/product/data/model/SearchRequest.kt` | 搜索请求模型 |
| `feature/menu/MenuScreen.kt` | 左右分栏分类页 |
| `feature/menu/MenuViewModel.kt` | 分类数据 + 选中状态 |

**搜索数据模型：**

```kotlin
// feature/product/data/model/SearchRequest.kt
@Serializable
data class SearchRequest(
    val keyword: String,
    val categoryId: String? = null,
    val priceMin: Double? = null,
    val priceMax: Double? = null,
    val sort: String = "relevance",  // relevance | price_asc | price_desc | sales | newest
    val page: Int = 1,
    val pageSize: Int = 20,
)

// core/storage/SearchHistoryStore.kt
@Singleton
class SearchHistoryStore @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) {
    val history: Flow<List<String>> = dataStore.data.map { prefs ->
        prefs[HISTORY_KEY]?.split(SEPARATOR)?.filter { it.isNotBlank() } ?: emptyList()
    }

    suspend fun add(keyword: String) { ... }  // 去重 + 最多 10 条
    suspend fun remove(keyword: String) { ... }
    suspend fun clear() { ... }

    companion object {
        private val HISTORY_KEY = stringPreferencesKey("search_history")
        private const val SEPARATOR = "\u001F"
    }
}
```

**搜索页状态：**

```kotlin
data class SearchUiState(
    val query: String = "",
    val isSearching: Boolean = false,
    val history: List<String> = emptyList(),
    val sort: String = "relevance",
)

// 搜索结果通过 Paging 3 Flow 独立管理
// val searchResults: Flow<PagingData<ProductListItem>>
```

**分类菜单布局：**

```
┌────────┬─────────────────────────┐
│        │                         │
│ 一级   │  二级分类 LazyVerticalGrid │
│ 分类   │                         │
│        │  ┌──────┐ ┌──────┐     │
│ ● 数码 │  │ 手机 │ │ 耳机 │     │
│   服饰 │  └──────┘ └──────┘     │
│   食品 │  ┌──────┐               │
│   美妆 │  │智能手表│              │
│   ...  │  └──────┘               │
│        │                         │
│ LazyCol│  [ See all 数码 → ]     │
│        │                         │
├────────┴─────────────────────────┤
```

- 左栏：固定宽 88dp，灰色背景 `#F5F5F5`
- 选中态：白色背景 + 左侧 3dp teal 竖条
- 右栏：3 列网格，图标 + 文字
- 底部 "See all" → 跳转 `ProductListRoute(categoryId, categoryName)`

**商品列表页：**

- 接收 `categoryId` 和 `categoryName`（从路由参数）
- 顶栏显示分类名称 + 返回按钮
- SortBar：综合 / 价格↑ / 价格↓ / 销量
- 2 列网格 + Paging 3 无限滚动
- API：`POST /api/v1/product/list` + `filters.categoryId` + `sort` + `order`

**验收标准：**
- [ ] 搜索页：输入框自动聚焦，软键盘弹出
- [ ] 搜索历史 DataStore 持久化，最多 10 条
- [ ] 点击历史词填入并搜索
- [ ] 清除全部历史
- [ ] 搜索结果排序切换（综合/价格↑/价格↓/销量/最新）
- [ ] 搜索结果 Paging 3 无限滚动
- [ ] 分类菜单左侧一级分类切换
- [ ] 右侧显示对应二级分类图标 + 文字
- [ ] 点击二级分类或 "See all" 跳转商品列表
- [ ] 商品列表排序切换正常
- [ ] 商品列表 Paging 3 无限滚动

---

### Phase 5 — 商品详情 + 购物车 ✅ 已完成

> 浏览 → 决策 → 加购的核心链路。

**新增文件：**

| 文件 | 说明 |
|------|------|
| `core/ui/component/PageHeader.kt` | 页面顶栏（返回+标题+右侧操作） |
| `core/ui/component/QuantityStepper.kt` | 数量 +/- 步进器 |
| `feature/product/detail/ProductDetailScreen.kt` | 商品详情页 |
| `feature/product/detail/ProductDetailViewModel.kt` | 详情 + SKU 选择逻辑 |
| `feature/product/detail/component/ImageCarousel.kt` | HorizontalPager 图片轮播 |
| `feature/product/detail/component/SkuSelector.kt` | SKU 属性选择器 |
| `feature/product/data/model/ProductDetail.kt` | 商品详情模型 |
| `feature/product/data/model/Sku.kt` | SKU 模型 |
| `feature/cart/CartScreen.kt` | 购物车 UI |
| `feature/cart/CartViewModel.kt` | 勾选/数量/删除/结算逻辑 |
| `feature/cart/data/CartApi.kt` | 购物车 Retrofit 接口 |
| `feature/cart/data/CartRepository.kt` | 购物车数据层 |
| `feature/cart/data/model/CartItem.kt` | 购物车条目模型 |
| `feature/cart/data/model/CheckoutPreview.kt` | 结算预览模型 |

**商品详情数据模型：**

```kotlin
// feature/product/data/model/ProductDetail.kt
@Serializable
data class ProductDetailRequest(val id: String)

@Serializable
data class ProductDetail(
    val id: String,
    val title: String,
    val slug: String,
    val description: String? = null,
    val brand: String? = null,
    val status: String,
    val attributes: JsonObject? = null,
    val minPrice: String? = null,    // 字符串元价格
    val maxPrice: String? = null,
    val totalSales: Int,
    val avgRating: String,
    val reviewCount: Int,
    val createdAt: String,
    val updatedAt: String,
    val images: List<ProductImage>,
    val skus: List<Sku>,
    val categories: List<ProductCategory>,
)

@Serializable
data class ProductImage(
    val id: String,
    val url: String,
    val altText: String? = null,
    val isPrimary: Boolean,
    val sortOrder: Int,
)

@Serializable
data class ProductCategory(
    val id: String,
    val name: String,
    val slug: String,
)

// feature/product/data/model/Sku.kt
@Serializable
data class Sku(
    val id: String,
    val skuCode: String,
    val price: String,              // 字符串元价格，如 "7999.00"
    val comparePrice: String? = null,
    val stock: Int,
    val attributes: JsonObject,     // {"颜色": "黑色", "内存": "256GB"}
    val status: String,
)
```

**购物车数据模型：**

```kotlin
// feature/cart/data/model/CartItem.kt
@Serializable
data class CartAddRequest(val skuId: String, val quantity: Int)

@Serializable
data class CartUpdateRequest(val skuId: String, val quantity: Int)

@Serializable
data class CartRemoveRequest(val skuIds: List<String>)

@Serializable
data class CartSelectRequest(val skuIds: List<String>, val selected: Boolean)

@Serializable
data class CartItem(
    val skuId: String,
    val quantity: Int,
    val selected: Boolean,
    val productId: String,
    val productTitle: String,
    val skuCode: String,
    val price: Double,              // 数值元价格
    val comparePrice: Double? = null,
    val stock: Int,
    val attributes: JsonObject,
    val imageUrl: String? = null,
    val status: String,
)

// feature/cart/data/model/CheckoutPreview.kt
@Serializable
data class CheckoutPreview(
    val items: List<CheckoutPreviewItem>,
    val totalAmount: Double,
    val totalQuantity: Int,
)

@Serializable
data class CheckoutPreviewItem(
    val skuId: String,
    val quantity: Int,
    val productId: String,
    val productTitle: String,
    val skuCode: String,
    val price: Double,
    val attributes: JsonObject,
    val imageUrl: String? = null,
    val subtotal: Double,
)
```

**Retrofit 接口：**

```kotlin
// feature/cart/data/CartApi.kt
interface CartApi {
    @POST("api/v1/cart/list")
    suspend fun list(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<CartItem>>

    @POST("api/v1/cart/add")
    suspend fun add(@Body request: CartAddRequest): ApiResponse<JsonElement?>

    @POST("api/v1/cart/update")
    suspend fun update(@Body request: CartUpdateRequest): ApiResponse<JsonElement?>

    @POST("api/v1/cart/remove")
    suspend fun remove(@Body request: CartRemoveRequest): ApiResponse<JsonElement?>

    @POST("api/v1/cart/select")
    suspend fun select(@Body request: CartSelectRequest): ApiResponse<JsonElement?>

    @POST("api/v1/cart/checkout/preview")
    suspend fun checkoutPreview(@Body body: JsonObject = buildJsonObject {}): ApiResponse<CheckoutPreview>
}
```

**商品详情页面结构：**

```
┌─────────────────────────────────┐
│ ←                    🛒   ⋮     │  PageHeader
├─────────────────────────────────┤
│ ┌─ HorizontalPager ──────────┐ │
│ │ 商品图片轮播                 │ │
│ │          1 / 3              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ¥7,999                PriceText │
│ ¥9,999 (划线价)    -20%         │
├─────────────────────────────────┤
│ iPhone 15 Pro 256GB             │
│ ⭐⭐⭐⭐☆ 4.5  (2000+ ratings)   │
├─────────────────────────────────┤
│ 规格选择                        │
│ [128GB] [256GB ✓] [512GB]      │  SkuSelector
├─────────────────────────────────┤
│ About this item                 │
│ 商品描述文字...                  │
├─────────────────────────────────┤
│ ┌──────────────┬──────────────┐ │  固定底栏
│ │  Add to Cart │  Buy Now     │ │
│ └──────────────┴──────────────┘ │
└─────────────────────────────────┘
```

**SKU 选择逻辑（核心算法，对标 H5）：**

```kotlin
// 从 skus[] 提取属性维度
// 例：颜色 [黑色, 白色, 蓝色], 内存 [128GB, 256GB, 512GB]
// 用户选择后匹配唯一 SKU → 更新价格/库存
// 库存为 0 的选项显示为禁用态

data class SkuDimension(
    val name: String,                    // 如 "颜色"
    val values: List<SkuDimensionValue>, // 可选值列表
)

data class SkuDimensionValue(
    val value: String,      // 如 "黑色"
    val selected: Boolean,
    val disabled: Boolean,  // 组合后库存为 0
)

fun extractDimensions(skus: List<Sku>): List<SkuDimension> { ... }
fun findMatchingSku(skus: List<Sku>, selected: Map<String, String>): Sku? { ... }
```

**购物车页面结构：**

```
┌─────────────────────────────────┐
│ Shopping Cart (3)               │
├─────────────────────────────────┤
│ ☑ ┌────┐ iPhone 15 Pro         │  LazyColumn
│   │ img│ 256GB 原色钛金属       │
│   └────┘ ¥9,999       [- 1 +]  │
│                         [删除]  │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ ☑ ┌────┐ 运动T恤               │
│   │ img│ L 黑色                 │
│   └────┘ ¥99          [- 2 +]  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │  固定底栏
│ │ ☑ 全选  小计: ¥10,098 (2件) │ │
│ │ [  Proceed to Checkout     ]│ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**购物车核心逻辑 — 300ms debounce 乐观更新：**

```kotlin
private val quantityUpdates = MutableSharedFlow<Pair<String, Int>>()

init {
    viewModelScope.launch {
        quantityUpdates
            .debounce(300)
            .collect { (skuId, qty) ->
                cartRepository.update(skuId, qty)
            }
    }
}

// 乐观更新：先改 UI 状态，再异步请求后端
fun updateQuantity(skuId: String, quantity: Int) {
    _state.update { s ->
        s.copy(items = s.items.map {
            if (it.skuId == skuId) it.copy(quantity = quantity) else it
        })
    }
    viewModelScope.launch { quantityUpdates.emit(skuId to quantity) }
}
```

**验收标准：**
- [ ] 详情页图片 HorizontalPager 轮播 + 页码指示器
- [ ] PriceText 正确显示价格 + 划线价 + 折扣百分比
- [ ] SKU 选择器提取属性维度并渲染
- [ ] 选择 SKU 联动价格/库存更新
- [ ] 库存为 0 的选项禁用态
- [ ] "Add to Cart" 调用 API + Snackbar 提示
- [ ] "Buy Now" 直接跳转订单创建页（携带当前 SKU）
- [ ] 底部操作栏固定不随页面滚动
- [ ] 未登录购物车 → 空状态 + "Sign in" 按钮
- [ ] 购物车列表正确渲染
- [ ] 勾选/取消勾选联动小计
- [ ] 数量 +/- 乐观更新 + 300ms debounce
- [ ] 滑动删除或点击删除
- [ ] 全选/取消全选
- [ ] "Proceed to Checkout" 跳转订单创建页
- [ ] 底部栏固定

---

### Phase 6 — 订单 + 支付 + 地址 `[ ]`

> 完整购买闭环：下单 → 支付 → 查看订单 + 地址管理。

**新增文件：**

| 文件 | 说明 |
|------|------|
| `core/network/IdempotencyInterceptor.kt` | 订单/支付幂等 key 自动注入 |
| `core/util/DateFormatter.kt` | ISO 8601 → 本地化日期时间 |
| `feature/order/create/OrderCreateScreen.kt` | 订单确认页 |
| `feature/order/create/OrderCreateViewModel.kt` | 下单逻辑 |
| `feature/order/list/OrderListScreen.kt` | 订单列表 |
| `feature/order/list/OrderListViewModel.kt` | 筛选 + 分页 |
| `feature/order/list/OrderPagingSource.kt` | Paging 3 数据源 |
| `feature/order/detail/OrderDetailScreen.kt` | 订单详情 |
| `feature/order/detail/OrderDetailViewModel.kt` | 详情 + 操作 |
| `feature/order/payment/PaymentScreen.kt` | 支付页 |
| `feature/order/payment/PaymentViewModel.kt` | 支付 + 倒计时 |
| `feature/order/data/OrderApi.kt` | 订单 Retrofit 接口 |
| `feature/order/data/OrderRepository.kt` | 订单数据层 |
| `feature/order/data/PaymentApi.kt` | 支付 Retrofit 接口 |
| `feature/order/data/PaymentRepository.kt` | 支付数据层 |
| `feature/order/data/model/Order.kt` | 订单模型 |
| `feature/order/data/model/OrderItem.kt` | 订单条目模型 |
| `feature/order/data/model/Payment.kt` | 支付模型 |
| `feature/user/address/AddressScreen.kt` | 地址管理页 |
| `feature/user/address/AddressViewModel.kt` | 地址 CRUD |
| `feature/user/data/AddressApi.kt` | 地址 Retrofit 接口 |
| `feature/user/data/AddressRepository.kt` | 地址数据层 |
| `feature/user/data/model/Address.kt` | 地址模型 |

**幂等拦截器：**

```kotlin
// core/network/IdempotencyInterceptor.kt
class IdempotencyInterceptor : Interceptor {
    // 匹配需要幂等 key 的路径
    private val idempotentPaths = setOf(
        "api/v1/order/create",
        "api/v1/payment/create",
    )

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath.trimStart('/')

        return if (path in idempotentPaths) {
            chain.proceed(
                request.newBuilder()
                    .header("X-Idempotency-Key", UUID.randomUUID().toString())
                    .build()
            )
        } else {
            chain.proceed(request)
        }
    }
}
```

**订单数据模型：**

```kotlin
// feature/order/data/model/Order.kt
@Serializable
data class OrderCreateRequest(
    val items: List<OrderCreateItem>,
    val addressId: String,
    val remark: String? = null,
)

@Serializable
data class OrderCreateItem(val skuId: String, val quantity: Int)

@Serializable
data class OrderListRequest(
    val page: Int = 1,
    val pageSize: Int = 10,
    val status: String? = null,
)

@Serializable
data class OrderDetailRequest(val orderId: String)

@Serializable
data class OrderCancelRequest(val orderId: String, val reason: String? = null)

@Serializable
data class Order(
    val id: String,
    val orderNo: String,
    val userId: String,
    val status: String,           // pending | paid | shipped | delivered | completed | cancelled | refunded
    val totalAmount: Double,
    val payAmount: Double,
    val remark: String? = null,
    val expiredAt: String,        // ISO 8601，30 分钟后过期
    val createdAt: String,
    val updatedAt: String,
    val items: List<OrderItem>,
    val address: OrderAddress,
)

// feature/order/data/model/OrderItem.kt
@Serializable
data class OrderItem(
    val id: String,
    val skuId: String,
    val productId: String,
    val productTitle: String,
    val skuCode: String,
    val skuAttributes: JsonObject,
    val imageUrl: String? = null,
    val price: Double,
    val quantity: Int,
    val subtotal: Double,
)

@Serializable
data class OrderAddress(
    val recipient: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val address: String,
    val postalCode: String? = null,
)

// feature/order/data/model/Payment.kt
@Serializable
data class PaymentCreateRequest(val orderId: String, val method: String = "mock")

@Serializable
data class PaymentQueryRequest(val orderId: String)

@Serializable
data class Payment(
    val id: String,
    val orderId: String,
    val transactionId: String? = null,
    val method: String,
    val amount: Double,
    val status: String,
    val createdAt: String,
)
```

**地址数据模型：**

```kotlin
// feature/user/data/model/Address.kt
@Serializable
data class Address(
    val id: String,
    val userId: String,
    val label: String? = null,
    val recipient: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val address: String,
    val postalCode: String? = null,
    val isDefault: Boolean,
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class AddressCreateRequest(
    val label: String? = null,
    val recipient: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val address: String,
    val postalCode: String? = null,
    val isDefault: Boolean = false,
)

@Serializable
data class AddressUpdateRequest(
    val id: String,
    val label: String? = null,
    val recipient: String? = null,
    val phone: String? = null,
    val province: String? = null,
    val city: String? = null,
    val district: String? = null,
    val address: String? = null,
    val postalCode: String? = null,
    val isDefault: Boolean? = null,
)

@Serializable
data class AddressDeleteRequest(val id: String)
```

**Retrofit 接口：**

```kotlin
// feature/order/data/OrderApi.kt
interface OrderApi {
    @POST("api/v1/order/create")
    suspend fun create(@Body request: OrderCreateRequest): ApiResponse<Order>

    @POST("api/v1/order/list")
    suspend fun list(@Body request: OrderListRequest): ApiResponse<PaginatedResult<Order>>

    @POST("api/v1/order/detail")
    suspend fun detail(@Body request: OrderDetailRequest): ApiResponse<Order>

    @POST("api/v1/order/cancel")
    suspend fun cancel(@Body request: OrderCancelRequest): ApiResponse<JsonElement?>
}

// feature/order/data/PaymentApi.kt
interface PaymentApi {
    @POST("api/v1/payment/create")
    suspend fun create(@Body request: PaymentCreateRequest): ApiResponse<Payment>

    @POST("api/v1/payment/query")
    suspend fun query(@Body request: PaymentQueryRequest): ApiResponse<Payment>
}

// feature/user/data/AddressApi.kt
interface AddressApi {
    @POST("api/v1/user/address/list")
    suspend fun list(@Body body: JsonObject = buildJsonObject {}): ApiResponse<List<Address>>

    @POST("api/v1/user/address/create")
    suspend fun create(@Body request: AddressCreateRequest): ApiResponse<Address>

    @POST("api/v1/user/address/update")
    suspend fun update(@Body request: AddressUpdateRequest): ApiResponse<Address>

    @POST("api/v1/user/address/delete")
    suspend fun delete(@Body request: AddressDeleteRequest): ApiResponse<JsonElement?>
}
```

**支付倒计时逻辑：**

```kotlin
// PaymentViewModel.kt
private fun startCountdown(expiredAt: String) {
    viewModelScope.launch {
        val expiryInstant = Instant.parse(expiredAt)
        while (true) {
            val remaining = Duration.between(Instant.now(), expiryInstant)
            if (remaining.isNegative) {
                _state.update { it.copy(isExpired = true) }
                break
            }
            _state.update { it.copy(
                remainingMinutes = remaining.toMinutes().toInt(),
                remainingSeconds = (remaining.seconds % 60).toInt(),
            ) }
            delay(1000)
        }
    }
}
```

**订单确认页面结构：**

```
┌─────────────────────────────────┐
│ ← Confirm Order                 │
├─────────────────────────────────┤
│ 📍 收货地址                      │
│ Alice  138xxxx1234              │
│ 上海市浦东新区xxx路              │
│ [ Change ]                      │
├─────────────────────────────────┤
│ 商品清单                         │
│ ┌────┐ iPhone 15 Pro            │
│ │ img│ 256GB  x1  ¥9,999       │
│ └────┘                          │
├─────────────────────────────────┤
│ 备注：[输入框]                   │
├─────────────────────────────────┤
│ 商品总额    ¥9,999.00           │
│ 运费        免运费               │
│ ─────────────────────           │
│ 应付总额    ¥9,999.00           │
├─────────────────────────────────┤
│ [     Place Order    ¥9,999    ]│  固定底栏
└─────────────────────────────────┘
```

**订单列表 Tab 筛选：**
- ScrollableTabRow：All / Pending / Paid / Shipped / Delivered / Completed / Cancelled
- 对应 status 参数：`null` / `pending` / `paid` / `shipped` / `delivered` / `completed` / `cancelled`

**验收标准：**
- [ ] 订单确认页展示地址 + 商品 + 金额
- [ ] 地址选择 BottomSheet（列表 + 新增）
- [ ] 无地址时引导新增
- [ ] "Place Order" → API 调用（含幂等 key）→ 跳转支付页
- [ ] 支付页显示金额 + 支付方式选择（mock）
- [ ] 30 分钟倒计时（秒级更新）
- [ ] "Pay Now" → API 调用（含幂等 key）→ 跳转订单详情
- [ ] 倒计时结束 → 提示已过期
- [ ] 订单列表 Tab 筛选 + Paging 3 分页
- [ ] 订单详情按状态显示操作按钮（取消/支付/确认收货）
- [ ] 取消订单 + 确认弹窗
- [ ] 地址管理 CRUD 完整
- [ ] 地址列表 + 新增/编辑 BottomSheet
- [ ] 设为默认 / 删除（确认弹窗）

---

### Phase 7 — 个人中心 + 全局优化 `[ ]`

> 个人中心 + 全局打磨，完成 App 闭环。

**新增文件：**

| 文件 | 说明 |
|------|------|
| `feature/user/profile/ProfileScreen.kt` | 个人中心 UI |
| `feature/user/profile/ProfileViewModel.kt` | 用户信息 + 最近订单 |
| `feature/user/data/UserApi.kt` | 用户 Retrofit 接口 |
| `feature/user/data/UserRepository.kt` | 用户数据层 |

**用户数据模型：**

```kotlin
// User.kt 复用 feature/auth/data/model/User.kt

@Serializable
data class UserUpdateRequest(
    val nickname: String? = null,
    val avatarUrl: String? = null,
    val phone: String? = null,
)
```

**Retrofit 接口：**

```kotlin
// feature/user/data/UserApi.kt
interface UserApi {
    @POST("api/v1/user/profile")
    suspend fun profile(@Body body: JsonObject = buildJsonObject {}): ApiResponse<User>

    @POST("api/v1/user/update")
    suspend fun update(@Body request: UserUpdateRequest): ApiResponse<User>
}
```

**个人中心页面结构：**

```
┌─────────────────────────────────┐
│ Hello, Alice 👋                  │  已登录态
├─────────────────────────────────┤
│ ┌────────┐ ┌────────┐          │
│ │  📦    │ │  📍    │          │  2x2 功能入口
│ │ Orders │ │Address │          │
│ └────────┘ └────────┘          │
│ ┌────────┐ ┌────────┐          │
│ │  👤    │ │  🚪    │          │
│ │Account │ │Sign Out│          │
│ └────────┘ └────────┘          │
├─────────────────────────────────┤
│ Your Orders                     │
│ ┌──────────────────────────┐   │  最近 3 条
│ │ #ORD20240305...  待付款   │   │
│ │ iPhone 15 Pro  ¥9,999    │   │
│ └──────────────────────────┘   │
│ [See all orders →]             │
└─────────────────────────────────┘
```

**全局优化清单：**

| 优化项 | 说明 |
|--------|------|
| 下拉刷新 | 首页、列表页、购物车、订单列表 PullToRefresh |
| 网络异常 | 无网络 → 全局提示 + 重试按钮 |
| Edge-to-Edge | 沉浸式状态栏（已在 MainActivity 启用 enableEdgeToEdge） |
| 转场动画 | 页面切换 fadeIn/slideIn 动画 |
| Coil 缓存 | 内存 + 磁盘缓存配置 |
| ProGuard | 混淆 + 优化 release 包 |
| 启动优化 | SplashScreen API 适配 |

**验收标准：**
- [ ] 未登录 → "Sign in" 引导页
- [ ] 已登录 → 用户名 + 2x2 功能入口
- [ ] 最近 3 条订单预览
- [ ] 点击入口跳转对应页面
- [ ] "Sign Out" → 清除 Token → 返回首页
- [ ] 下拉刷新全局生效
- [ ] 网络异常全局提示
- [ ] 转场动画流畅
- [ ] Release APK 体积合理

---

## Phase 依赖关系

```
Phase 1 ✅ (基础设施)
  └─→ Phase 2 ✅ (导航 + 认证 + P1 修复)
        ├─→ Phase 3 ✅ (首页 + 共享组件)
        │     └─→ Phase 4 ✅ (搜索 + 分类 + 列表)
        │           └─→ Phase 5 ✅ (商品详情 + 购物车)
        │                 └─→ Phase 6 (订单 + 支付 + 地址)
        │                       └─→ Phase 7 (个人中心 + 优化)
        └─→ Phase 7 可提前开发 Profile UI（不依赖订单）
```

**可并行的 Phase：**
- Phase 4 中的搜索、分类、列表三个子模块可并行
- Phase 5 中的详情和购物车可并行
- Phase 6 中的地址管理可与订单并行
- Phase 7 的 Profile UI 可与 Phase 4+ 并行（但需要 Phase 2 的导航框架）

---

## 当前实现状态

| Phase | 描述 | 状态 |
|-------|------|------|
| Phase 1 | 项目初始化 + 核心基础设施 | ✅ 已完成（Bug 已在 Phase 2 修复） |
| Phase 2 | 导航 + 认证 + Phase 1 修复 | ✅ 已完成 |
| Phase 3 | 首页 + 共享组件 | ✅ 已完成 |
| Phase 4 | 搜索 + 分类 + 商品列表 | ✅ 已完成 |
| Phase 5 | 商品详情 + 购物车 | ✅ 已完成 |
| Phase 6 | 订单 + 支付 + 地址 | ⬜ 待实现 |
| Phase 7 | 个人中心 + 全局优化 | ⬜ 待实现 |

---

## H5 → Android 文件对照表

| H5 文件 | Android 对应 |
|---------|-------------|
| `apps/h5/src/router.tsx` | `navigation/AppNavGraph.kt` |
| `apps/h5/src/layouts/root-layout.tsx` | `navigation/MainScreen.kt` + `BottomNavBar.kt` |
| `apps/h5/src/stores/home.ts` | `feature/home/HomeViewModel.kt` |
| `apps/h5/src/stores/cart.ts` | `feature/cart/CartViewModel.kt` |
| `apps/h5/src/stores/category.ts` | `feature/menu/MenuViewModel.kt` |
| `apps/h5/src/stores/profile.ts` | `feature/user/profile/ProfileViewModel.kt` |
| `apps/h5/src/components/product-card.tsx` | `core/ui/component/ProductCard.kt` |
| `apps/h5/src/components/product-grid.tsx` | `core/ui/component/ProductGrid.kt` |
| `apps/h5/src/components/sort-bar.tsx` | `core/ui/component/SortBar.kt` |
| `apps/h5/src/components/page-header.tsx` | `core/ui/component/PageHeader.kt` |
| `apps/h5/src/pages/home/index.tsx` | `feature/home/HomeScreen.kt` |
| `apps/h5/src/pages/product/detail.tsx` | `feature/product/detail/ProductDetailScreen.kt` |
| `apps/h5/src/pages/product/list.tsx` | `feature/product/list/ProductListScreen.kt` |
| `apps/h5/src/pages/product/search.tsx` | `feature/product/search/SearchScreen.kt` |
| `apps/h5/src/pages/menu/index.tsx` | `feature/menu/MenuScreen.kt` |
| `apps/h5/src/pages/cart/index.tsx` | `feature/cart/CartScreen.kt` |
| `apps/h5/src/pages/order/create.tsx` | `feature/order/create/OrderCreateScreen.kt` |
| `apps/h5/src/pages/order/list.tsx` | `feature/order/list/OrderListScreen.kt` |
| `apps/h5/src/pages/order/detail.tsx` | `feature/order/detail/OrderDetailScreen.kt` |
| `apps/h5/src/pages/order/payment.tsx` | `feature/order/payment/PaymentScreen.kt` |
| `apps/h5/src/pages/user/profile.tsx` | `feature/user/profile/ProfileScreen.kt` |
| `apps/h5/src/pages/user/address.tsx` | `feature/user/address/AddressScreen.kt` |
| `apps/h5/src/pages/auth/login.tsx` | `feature/auth/login/LoginScreen.kt` |
| `apps/h5/src/pages/auth/register.tsx` | `feature/auth/register/RegisterScreen.kt` |
| `apps/h5/src/styles/globals.scss` | `core/ui/theme/ShopTheme.kt` |

---

## API 通信规则（Android 端）

1. **全部 POST**，Body 为 JSON（与 H5 一致）
2. OkHttp `AuthInterceptor` 自动注入 `Authorization: Bearer <token>`
3. 401 → `TokenAuthenticator` 自动刷新（Mutex 防并发），失败则清除 Token 跳登录
4. 订单/支付请求通过 `IdempotencyInterceptor` 注入 `X-Idempotency-Key`（UUID v4）
5. 统一响应 `ApiResponse<T>` 解析，非 success 抛 `ApiError`
6. 无返回数据的接口使用 `ApiResponse<T>.requireSuccess()` 校验
7. Repository 层捕获异常，ViewModel 层决定 UI 反馈（Snackbar/Dialog）

**价格类型注意：**
- 商品接口（product/list、product/detail）：价格为 **字符串**（`"7999.00"`）→ 使用 `PriceFormatter.format(price: String)`
- 购物车/订单接口（cart/list、order/create 等）：价格为 **数值**（`7999.0`）→ 使用 `PriceFormatter.format(price: Double)`
