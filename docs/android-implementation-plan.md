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
| 导航 | Navigation Compose | 2.8+ | 类型安全路由 |
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

```
apps/android/
├── build.gradle.kts                          # 根构建配置
├── settings.gradle.kts
├── gradle/
│   └── libs.versions.toml                    # Version Catalog
│
└── app/
    ├── build.gradle.kts
    └── src/main/
        ├── AndroidManifest.xml
        └── java/com/example/shop/
            │
            ├── ShopApp.kt                    # Application + @HiltAndroidApp
            ├── MainActivity.kt               # 单 Activity 入口
            │
            ├── core/                         # ════════ 核心基础层 ════════
            │   │
            │   ├── network/
            │   │   ├── ApiClient.kt          # Retrofit + OkHttp 配置
            │   │   ├── ApiResponse.kt        # { code, success, data, message, traceId }
            │   │   ├── ApiError.kt           # 统一异常，对标 @fe/api-client 的 ApiError
            │   │   ├── AuthInterceptor.kt    # 请求注入 Bearer token
            │   │   ├── TokenAuthenticator.kt # 401 自动刷新 token
            │   │   └── IdempotencyInterceptor.kt  # 订单/支付幂等 key 注入
            │   │
            │   ├── storage/
            │   │   ├── TokenStore.kt         # DataStore 存储 access/refresh token
            │   │   └── SearchHistoryStore.kt # DataStore 存储搜索历史
            │   │
            │   ├── model/
            │   │   ├── ApiResponse.kt        # 通用响应包装 { code, success, data }
            │   │   ├── PaginatedResult.kt    # 分页结构 { items, pagination }
            │   │   ├── Pagination.kt         # { page, pageSize, total, totalPages }
            │   │   └── ErrorCode.kt          # 业务错误码常量（对标 @fe/shared）
            │   │
            │   ├── ui/
            │   │   ├── theme/
            │   │   │   ├── ShopTheme.kt      # Material3 主题 + Amazon 色系
            │   │   │   ├── Color.kt          # 色值定义
            │   │   │   ├── Typography.kt     # 字体系统
            │   │   │   └── Dimens.kt         # 尺寸规范（间距、圆角等）
            │   │   │
            │   │   └── component/            # 跨 feature 复用组件
            │   │       ├── ProductCard.kt    # 商品卡片（图片+标题+价格+评分）
            │   │       ├── ProductGrid.kt    # 2 列商品网格 + Paging 3 无限滚动
            │   │       ├── SortBar.kt        # 排序切换栏
            │   │       ├── PageHeader.kt     # 页面顶栏（返回+标题+右侧操作）
            │   │       ├── PriceText.kt      # 价格显示（¥大字+小数+划线价）
            │   │       ├── QuantityStepper.kt# 数量 +/- 步进器
            │   │       ├── RatingBar.kt      # 星级评分条
            │   │       ├── SkeletonLoader.kt # 骨架屏加载占位
            │   │       ├── EmptyState.kt     # 空状态提示
            │   │       └── LoadingButton.kt  # 带 loading 状态的按钮
            │   │
            │   ├── util/
            │   │   ├── PriceFormatter.kt     # 金额格式化 (分→元，千位逗号)
            │   │   ├── DateFormatter.kt      # 日期时间格式化
            │   │   └── Extensions.kt         # 通用扩展函数
            │   │
            │   └── di/
            │       ├── NetworkModule.kt      # 提供 Retrofit / OkHttpClient
            │       ├── StorageModule.kt      # 提供 DataStore
            │       └── RepositoryModule.kt   # 提供各 Repository 绑定
            │
            ├── navigation/                   # ════════ 全局导航 ════════
            │   ├── Route.kt                  # sealed class 路由定义
            │   ├── AppNavGraph.kt            # NavHost 路由表
            │   ├── BottomNavBar.kt           # 底部 4-Tab 导航
            │   └── MainScreen.kt             # Scaffold 骨架（顶栏+内容+底栏）
            │
            └── feature/                      # ════════ 业务功能层 ════════
                │
                ├── home/                     # 首页
                │   ├── HomeScreen.kt
                │   ├── HomeViewModel.kt
                │   ├── HomeUiState.kt
                │   ├── component/
                │   │   ├── BannerCarousel.kt       # 自动轮播 + 手势滑动
                │   │   ├── CategoryPills.kt        # 分类横滑胶囊
                │   │   ├── DealSection.kt          # Deal of the Day 横滑
                │   │   ├── CategoryShowcase.kt     # 分类展示卡片
                │   │   ├── NewArrivalsSection.kt   # 新品区
                │   │   └── TopRatedSection.kt      # 好评区
                │   └── data/
                │       ├── HomeApi.kt
                │       └── HomeRepository.kt
                │
                ├── product/                  # 商品
                │   ├── list/
                │   │   ├── ProductListScreen.kt
                │   │   ├── ProductListViewModel.kt
                │   │   └── ProductPagingSource.kt  # Paging 3 数据源
                │   ├── detail/
                │   │   ├── ProductDetailScreen.kt
                │   │   ├── ProductDetailViewModel.kt
                │   │   ├── ProductDetailUiState.kt
                │   │   └── component/
                │   │       ├── ImageCarousel.kt    # HorizontalPager 图片轮播
                │   │       └── SkuSelector.kt      # SKU 属性选择器
                │   ├── search/
                │   │   ├── SearchScreen.kt
                │   │   ├── SearchViewModel.kt
                │   │   └── SearchUiState.kt
                │   └── data/
                │       ├── ProductApi.kt
                │       ├── ProductRepository.kt
                │       └── model/
                │           ├── Product.kt
                │           ├── ProductDetail.kt
                │           ├── Sku.kt
                │           └── SearchResult.kt
                │
                ├── menu/                     # 分类菜单
                │   ├── MenuScreen.kt
                │   ├── MenuViewModel.kt
                │   ├── MenuUiState.kt
                │   └── data/
                │       ├── CategoryApi.kt
                │       ├── CategoryRepository.kt
                │       └── model/
                │           └── Category.kt
                │
                ├── cart/                     # 购物车
                │   ├── CartScreen.kt
                │   ├── CartViewModel.kt
                │   ├── CartUiState.kt
                │   └── data/
                │       ├── CartApi.kt
                │       ├── CartRepository.kt
                │       └── model/
                │           └── CartItem.kt
                │
                ├── order/                    # 订单
                │   ├── create/
                │   │   ├── OrderCreateScreen.kt
                │   │   ├── OrderCreateViewModel.kt
                │   │   └── OrderCreateUiState.kt
                │   ├── list/
                │   │   ├── OrderListScreen.kt
                │   │   ├── OrderListViewModel.kt
                │   │   └── OrderPagingSource.kt
                │   ├── detail/
                │   │   ├── OrderDetailScreen.kt
                │   │   ├── OrderDetailViewModel.kt
                │   │   └── OrderDetailUiState.kt
                │   ├── payment/
                │   │   ├── PaymentScreen.kt
                │   │   ├── PaymentViewModel.kt
                │   │   └── PaymentUiState.kt
                │   └── data/
                │       ├── OrderApi.kt
                │       ├── OrderRepository.kt
                │       ├── PaymentApi.kt
                │       ├── PaymentRepository.kt
                │       └── model/
                │           ├── Order.kt
                │           ├── OrderItem.kt
                │           ├── OrderStatus.kt
                │           └── Payment.kt
                │
                ├── user/                     # 用户
                │   ├── profile/
                │   │   ├── ProfileScreen.kt
                │   │   ├── ProfileViewModel.kt
                │   │   └── ProfileUiState.kt
                │   ├── address/
                │   │   ├── AddressScreen.kt
                │   │   ├── AddressViewModel.kt
                │   │   └── AddressUiState.kt
                │   └── data/
                │       ├── UserApi.kt
                │       ├── UserRepository.kt
                │       ├── AddressApi.kt
                │       ├── AddressRepository.kt
                │       └── model/
                │           ├── User.kt
                │           └── Address.kt
                │
                └── auth/                     # 认证
                    ├── login/
                    │   ├── LoginScreen.kt
                    │   ├── LoginViewModel.kt
                    │   └── LoginUiState.kt
                    ├── register/
                    │   ├── RegisterScreen.kt
                    │   ├── RegisterViewModel.kt
                    │   └── RegisterUiState.kt
                    └── data/
                        ├── AuthApi.kt
                        ├── AuthRepository.kt
                        └── model/
                            └── AuthToken.kt
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
| `build.gradle.kts` (root) | Gradle 配置，Hilt plugin |
| `app/build.gradle.kts` | Compose、Hilt、Retrofit、Coil 等依赖 |
| `gradle/libs.versions.toml` | Version Catalog 集中管理版本 |
| `ShopApp.kt` | `@HiltAndroidApp` Application |
| `MainActivity.kt` | 单 Activity + `setContent { ShopTheme {} }` |
| `core/ui/theme/*` | Material3 主题，Amazon 色系 |
| `core/network/ApiResponse.kt` | `{ code, success, data, message, traceId }` 解析 |
| `core/network/ApiClient.kt` | Retrofit 单例 + OkHttp + 日志拦截器 |
| `core/network/ApiError.kt` | 统一异常类，支持 `err.is(ErrorCode.XXX)` |
| `core/network/AuthInterceptor.kt` | 请求注入 Bearer token |
| `core/network/TokenAuthenticator.kt` | 401 自动刷新 |
| `core/storage/TokenStore.kt` | DataStore 加密存储 token |
| `core/model/ErrorCode.kt` | 业务错误码 |
| `core/model/PaginatedResult.kt` | 分页响应结构 |
| `core/di/NetworkModule.kt` | Hilt 提供 Retrofit / OkHttpClient |
| `core/di/StorageModule.kt` | Hilt 提供 DataStore |

**核心代码示例：**

```kotlin
// ApiResponse.kt — 统一响应解析
@Serializable
data class ApiResponse<T>(
    val code: Int,
    val success: Boolean,
    val data: T? = null,
    val message: String = "",
    val traceId: String = "",
)

// ApiError.kt — 对标 @fe/api-client 的 ApiError
class ApiError(
    val code: Int,
    val errorCode: String?,
    override val message: String,
) : Exception(message) {
    fun is(expected: String): Boolean = errorCode == expected
}

// TokenAuthenticator.kt — 401 自动刷新
class TokenAuthenticator @Inject constructor(
    private val tokenStore: TokenStore,
    private val authApi: Lazy<AuthApi>,
) : Authenticator {
    private val mutex = Mutex()

    override fun authenticate(route: Route?, response: Response): Request? {
        return runBlocking {
            mutex.withLock {
                val refreshToken = tokenStore.refreshToken.first() ?: return@withLock null
                try {
                    val result = authApi.get().refresh(RefreshRequest(refreshToken))
                    tokenStore.save(result.data!!)
                    response.request.newBuilder()
                        .header("Authorization", "Bearer ${result.data.accessToken}")
                        .build()
                } catch (e: Exception) {
                    tokenStore.clear()
                    null
                }
            }
        }
    }
}
```

**验收标准：**
- [ ] 项目编译通过，空白页启动
- [ ] Retrofit 能请求后端 `/api/v1/product/list` 并解析
- [ ] Token 存取正常（DataStore）
- [ ] Hilt 依赖注入正常
- [ ] Amazon 主题色正确

---

### Phase 2 — 导航框架 + 认证流程 `[ ]`

> 搭建全局导航骨架，完成登录/注册闭环。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `navigation/Route.kt` | 全部路由定义 |
| `navigation/AppNavGraph.kt` | NavHost 路由表 |
| `navigation/BottomNavBar.kt` | 4-Tab 底栏（Home/You/Cart/Menu） |
| `navigation/MainScreen.kt` | Scaffold + 条件显示底栏 |
| `feature/auth/data/*` | AuthApi + AuthRepository |
| `feature/auth/login/*` | LoginScreen + ViewModel |
| `feature/auth/register/*` | RegisterScreen + ViewModel |

**路由定义：**

```kotlin
sealed class Route(val route: String) {
    // Tab 页面（显示底栏）
    data object Home : Route("home")
    data object Profile : Route("me")
    data object Cart : Route("cart")
    data object Menu : Route("menu")

    // 独立页面（不显示底栏）
    data object Search : Route("search")
    data object ProductList : Route("product?categoryId={categoryId}")
    data class ProductDetail(val id: String) : Route("dp/{id}")
    data object OrderCreate : Route("order/create")
    data object OrderList : Route("order")
    data class OrderDetail(val id: String) : Route("order/{id}")
    data class Payment(val id: String) : Route("order/{id}/pay")
    data object AddressManage : Route("me/address")

    // 认证页面（Guest Only）
    data object Login : Route("login")
    data object Register : Route("register")
}
```

**底栏规格（对标 H5）：**
- 高度：56dp，白色背景，顶部 1dp `#DDD` 分割线
- 图标：24dp，Material Icons
- 文字：12sp
- 选中色：`#007185`（teal），未选中：`#565959`
- Cart Tab 右上角 Badge（橙色圆点 + 数量）

**验收标准：**
- [ ] 4 个 Tab 可切换，底栏高亮正确
- [ ] Tab 页面显示底栏，其他页面隐藏
- [ ] 登录/注册表单验证 + API 调用
- [ ] 登录成功 → 保存 Token → 跳转首页
- [ ] 已登录用户访问登录页 → 重定向首页
- [ ] 未登录访问购物车 → 重定向登录页

---

### Phase 3 — 首页 Home `[ ]`

> 用户看到的第一个页面，Amazon 风格多区块首页。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `feature/home/HomeScreen.kt` | 首页主体，LazyColumn 多区块 |
| `feature/home/HomeViewModel.kt` | 并行加载分类/Banner/Deal/推荐 |
| `feature/home/HomeUiState.kt` | 聚合状态 |
| `feature/home/component/BannerCarousel.kt` | HorizontalPager + 自动翻页 |
| `feature/home/component/CategoryPills.kt` | LazyRow 分类胶囊 |
| `feature/home/component/DealSection.kt` | Deal of the Day 横滑卡片 |
| `feature/home/component/CategoryShowcase.kt` | 分类推荐展示 |
| `feature/home/component/NewArrivalsSection.kt` | 新品区 |
| `feature/home/component/TopRatedSection.kt` | 好评区 |
| `feature/home/data/*` | HomeApi + HomeRepository |
| `feature/menu/data/*` | CategoryApi + CategoryRepository（首页复用） |
| `core/ui/component/ProductCard.kt` | 商品卡片 |
| `core/ui/component/ProductGrid.kt` | 2 列网格 |
| `core/ui/component/PriceText.kt` | 价格组件 |
| `core/ui/component/RatingBar.kt` | 星级评分 |
| `core/ui/component/SkeletonLoader.kt` | 骨架屏 |

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

**API 调用：**

| 区域 | API | 参数 |
|------|-----|------|
| 分类胶囊 | `POST /api/v1/category/tree` | `{}` |
| Banner | `POST /api/v1/banner/list` | `{}` |
| Deal of the Day | `POST /api/v1/product/list` | `sort: sales, order: desc, pageSize: 10` |
| New Arrivals | `POST /api/v1/product/list` | `sort: createdAt, order: desc, pageSize: 10` |
| Recommended | `POST /api/v1/product/list` | `sort: createdAt, order: desc` + Paging |

**验收标准：**
- [ ] 搜索栏点击跳转搜索页
- [ ] 分类胶囊横滑，点击跳转商品列表
- [ ] Banner 自动轮播 3 秒 + 手势滑动
- [ ] Deal 横滑展示热销商品
- [ ] 推荐区 2 列网格无限滚动
- [ ] 首次加载显示骨架屏
- [ ] 下拉刷新

---

### Phase 4 — 搜索页 Search `[ ]`

> 全屏搜索，历史 + 热词 + 结果列表。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `feature/product/search/SearchScreen.kt` | 搜索页 UI |
| `feature/product/search/SearchViewModel.kt` | 搜索逻辑 + 历史管理 |
| `feature/product/search/SearchUiState.kt` | 初始态/搜索结果态 |
| `core/storage/SearchHistoryStore.kt` | DataStore 持久化搜索历史 |
| `core/ui/component/SortBar.kt` | 排序切换栏（复用） |

**页面状态：**

```kotlin
sealed interface SearchUiState {
    // 未搜索：显示历史 + 热词
    data class Initial(
        val history: List<String>,
        val hotKeywords: List<String>,
    ) : SearchUiState

    // 搜索结果：商品列表 + 排序
    data class Results(
        val keyword: String,
        val sort: SearchSort,
        val products: LazyPagingItems<Product>,  // Paging 3
    ) : SearchUiState
}
```

**验收标准：**
- [ ] 输入框自动聚焦，软键盘弹出
- [ ] 搜索历史持久化，最多 10 条
- [ ] 点击历史/热词填入并搜索
- [ ] 清除历史按钮
- [ ] 搜索结果排序切换（综合/价格↑/价格↓/销量）
- [ ] 无限滚动分页

---

### Phase 5 — 分类页 Menu `[ ]`

> 左右分栏分类浏览，对标 Amazon 的 ≡ 菜单。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `feature/menu/MenuScreen.kt` | 左右分栏布局 |
| `feature/menu/MenuViewModel.kt` | 分类数据 + 选中状态 |
| `feature/menu/MenuUiState.kt` | 状态定义 |

**布局：**

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
- 底部 "See all" → `/product?categoryId=xxx`

**API：** `POST /api/v1/category/tree` → 一次请求，前端拆分

**验收标准：**
- [ ] 左侧一级分类可切换
- [ ] 右侧显示对应二级分类
- [ ] 点击二级分类跳转商品列表
- [ ] 左侧选中态样式正确

---

### Phase 6 — 商品列表 & 详情 `[ ]`

> 浏览 → 决策的核心链路。

#### 6a. 商品列表

**文件清单：**

| 文件 | 说明 |
|------|------|
| `feature/product/list/ProductListScreen.kt` | 列表页 |
| `feature/product/list/ProductListViewModel.kt` | 排序 + 分页 |
| `feature/product/list/ProductPagingSource.kt` | Paging 3 数据源 |

**API：** `POST /api/v1/product/list` + `categoryId` 筛选 + 排序 + 分页

#### 6b. 商品详情

**文件清单：**

| 文件 | 说明 |
|------|------|
| `feature/product/detail/ProductDetailScreen.kt` | 详情页 |
| `feature/product/detail/ProductDetailViewModel.kt` | 详情 + SKU 选择逻辑 |
| `feature/product/detail/ProductDetailUiState.kt` | 状态 |
| `feature/product/detail/component/ImageCarousel.kt` | HorizontalPager 图片轮播 |
| `feature/product/detail/component/SkuSelector.kt` | SKU 属性选择器 |

**页面结构：**

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
```

**API：**
- `POST /api/v1/product/detail` — 商品信息 + 图片 + SKU
- `POST /api/v1/cart/add` — 加入购物车

**验收标准：**
- [ ] 列表页排序切换正常
- [ ] 列表页 Paging 3 无限滚动
- [ ] 详情页图片 HorizontalPager 轮播
- [ ] SKU 选择器联动价格/库存
- [ ] 库存为 0 禁用选项
- [ ] Add to Cart 调用 API + Snackbar 提示
- [ ] Buy Now → 直接跳转下单（选中当前 SKU）
- [ ] 底部操作栏固定不随页面滚动

---

### Phase 7 — 购物车 Cart `[ ]`

> Tab 页面，完整的购物车交互。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `feature/cart/CartScreen.kt` | 购物车 UI |
| `feature/cart/CartViewModel.kt` | 勾选/数量/删除/结算逻辑 |
| `feature/cart/CartUiState.kt` | 状态 |
| `feature/cart/data/*` | CartApi + CartRepository |
| `core/ui/component/QuantityStepper.kt` | 数量步进器 |

**页面结构：**

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

**核心逻辑：**

```kotlin
// 数量修改 — 300ms debounce（对标 H5）
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

**API：**

| 操作 | API |
|------|-----|
| 加载列表 | `POST /api/v1/cart/list` |
| 修改数量 | `POST /api/v1/cart/update` |
| 删除商品 | `POST /api/v1/cart/remove` |
| 勾选/取消 | `POST /api/v1/cart/select` |
| 结算预览 | `POST /api/v1/cart/checkout/preview` |

**验收标准：**
- [ ] 未登录 → 空状态 + "Sign in" 按钮
- [ ] 购物车列表正确渲染
- [ ] 勾选/取消勾选联动小计
- [ ] 数量 +/- 乐观更新 + 300ms debounce
- [ ] 滑动删除或点击删除
- [ ] 全选/取消全选
- [ ] 结算跳转订单确认页
- [ ] 底部栏固定

---

### Phase 8 — 个人中心 Profile `[ ]`

> Amazon "Your Account" 风格。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `feature/user/profile/ProfileScreen.kt` | 个人中心 |
| `feature/user/profile/ProfileViewModel.kt` | 用户信息 + 最近订单 |
| `feature/user/profile/ProfileUiState.kt` | 状态 |
| `feature/user/data/*` | UserApi + UserRepository |

**页面结构：**

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

**API：**
- `POST /api/v1/user/profile`
- `POST /api/v1/order/list` (page: 1, pageSize: 3)

**验收标准：**
- [ ] 未登录 → "Sign in" 引导页
- [ ] 已登录 → 用户名 + 2x2 功能入口
- [ ] 最近 3 条订单预览
- [ ] Sign Out → 清除 Token → 返回首页

---

### Phase 9 — 订单全流程 `[ ]`

> 下单 → 支付 → 查看，完整闭环。

#### 9a. 订单确认页

**文件：** `feature/order/create/*`

- 收货地址选择（BottomSheet 弹出地址列表）
- 商品清单（从 checkout/preview 获取）
- 金额汇总
- "Place Order" → `POST /api/v1/order/create` + 幂等 key

#### 9b. 支付页

**文件：** `feature/order/payment/*`

- 订单金额显示
- 支付方式选择（Alipay / WeChat / Mock）
- 30 分钟倒计时
- "Pay Now" → `POST /api/v1/payment/create` + 幂等 key
- 成功 → 跳转订单详情

#### 9c. 订单列表

**文件：** `feature/order/list/*`

- Tab 切换：All / Pending / Paid / Shipped / Delivered / Completed / Cancelled
- ScrollableTabRow 横滑 Tab
- Paging 3 无限滚动
- API：`POST /api/v1/order/list`

#### 9d. 订单详情

**文件：** `feature/order/detail/*`

- 状态 Banner（颜色随状态变化）
- 收货地址
- 商品清单
- 金额明细
- 操作按钮（取消/支付/确认收货）
- API：`POST /api/v1/order/detail`

**验收标准：**
- [ ] 订单确认页展示地址 + 商品 + 金额
- [ ] 地址选择 BottomSheet
- [ ] 幂等 key 防重复提交
- [ ] 下单成功 → 跳转支付页
- [ ] 支付倒计时（30 分钟）
- [ ] 支付成功跳转订单详情
- [ ] 订单列表 Tab 筛选 + 分页
- [ ] 订单详情按状态显示操作按钮
- [ ] 取消订单 + 确认弹窗

---

### Phase 10 — 地址管理 + 收尾优化 `[ ]`

> 最后一个功能模块 + 全局打磨。

#### 10a. 地址管理

**文件：** `feature/user/address/*`

- 地址列表
- 新增/编辑（BottomSheet 表单）
- 设为默认 / 删除
- API：address CRUD

#### 10b. 全局优化

| 优化项 | 说明 |
|--------|------|
| 下拉刷新 | 首页、列表页、购物车添加 PullToRefresh |
| 网络异常处理 | 无网络 → 全局提示 + 重试按钮 |
| 深色模式 | 适配 Material3 dark theme |
| Edge-to-Edge | 沉浸式状态栏 |
| 转场动画 | 页面切换 + 共享元素动画 |
| ProGuard | 混淆 + 优化 release 包 |
| 启动优化 | SplashScreen API + 预加载 |
| Coil 缓存策略 | 内存 + 磁盘缓存配置 |

**验收标准：**
- [ ] 地址 CRUD 完整
- [ ] 下拉刷新全局生效
- [ ] 深色模式可用
- [ ] 转场动画流畅
- [ ] Release APK < 15MB
- [ ] 冷启动 < 800ms

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

**可并行的 Phase：**
- Phase 3 / 4 / 5 可并行（都是浏览类页面）
- Phase 7 / 8 可并行（购物车和个人中心独立）

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
2. OkHttp Interceptor 自动注入 `Authorization: Bearer <token>`
3. 401 → TokenAuthenticator 自动刷新，失败则清除 Token 跳登录
4. 订单/支付请求通过 IdempotencyInterceptor 注入 `X-Idempotency-Key`
5. 统一响应 `ApiResponse<T>` 解析，非 success 抛 `ApiError`
6. Repository 层 catch ApiError，ViewModel 层决定 UI 反馈（Snackbar/Dialog）

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
