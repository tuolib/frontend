# Android 启动流程详解（对比 H5）

> 以本项目实际代码为例，逐步讲解 Android App 从点击图标到页面渲染的完整流程。

---

## 整体对比

| 步骤 | H5 (React) | Android (Compose) |
|------|-----------|-------------------|
| 入口文件 | `index.html` + `main.tsx` | `AndroidManifest.xml` + `MainActivity.kt` |
| 全局初始化 | — | `ShopApp.kt` (`@HiltAndroidApp` 注册 DI) |
| 挂载根组件 | `ReactDOM.createRoot().render(<App />)` | `setContent { ShopTheme { MainScreen() } }` |
| 全局样式/主题 | `globals.scss` + CSS variables | `ShopTheme.kt` + `Color.kt` |
| 页面骨架 | `root-layout.tsx` | `MainScreen.kt` (Scaffold) |
| 路由表 | `router.tsx` (React Router) | `AppNavGraph.kt` (NavHost) |
| 底部导航 | `<BottomNav />` 组件 | `BottomNavBar.kt` |
| 状态管理 | Zustand store | ViewModel + StateFlow |
| 依赖注入 | — (直接 import) | Hilt (`@Inject`, `@HiltViewModel`) |

---

## 第一步：Application 初始化

> H5 没有对应概念。Android 独有，在任何界面创建之前执行。

```
用户点击 App 图标
  ↓
Android 系统创建进程
  ↓
读取 AndroidManifest.xml → 找到 android:name=".ShopApp"
  ↓
实例化 ShopApp (Application)
  ↓
@HiltAndroidApp 触发 → Hilt 初始化依赖注入容器
```

**涉及文件：**

- `AndroidManifest.xml` — 声明 Application 类名和入口 Activity
- `ShopApp.kt` — `@HiltAndroidApp` 标注，触发 Hilt DI 容器初始化

**Hilt 做了什么？**

把 `NetworkModule`、`StorageModule`、`RepositoryModule` 里定义的依赖全部注册好：

| Module | 注册的依赖 | 说明 |
|--------|-----------|------|
| `NetworkModule` | `Json`、`OkHttpClient`、`Retrofit`、`TokenAuthenticator` | 网络层 |
| `StorageModule` | `DataStore<Preferences>` | 本地存储 |
| `RepositoryModule` | `AuthApi` | API 接口 |

注意：此时只是**注册**，还没创建实例。Hilt 采用懒加载，等谁用到才创建。

---

## 第二步：启动 MainActivity

> 相当于 H5 的 `index.html` + `main.tsx`。

```
AndroidManifest.xml 里的 intent-filter:
  action = MAIN + category = LAUNCHER
  → 系统知道 MainActivity 是入口
  ↓
创建 MainActivity 实例 → 调用 onCreate()
```

**涉及文件：** `MainActivity.kt`

```kotlin
@AndroidEntryPoint                          // Hilt: 允许在这个 Activity 中注入依赖
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()      // ① 沉浸式，内容延伸到状态栏/导航栏下方
        setContent {            // ② 进入 Compose 世界（≈ ReactDOM.createRoot().render()）
            ShopTheme {         // ③ 主题包裹（≈ globals.scss + CSS variables）
                MainScreen()    // ④ 根组件（≈ <App /> 或 root-layout.tsx）
            }
        }
    }
}
```

逐行解释：

| 代码 | 作用 | H5 类比 |
|------|------|--------|
| `@AndroidEntryPoint` | 告诉 Hilt 这个 Activity 需要依赖注入 | — |
| `enableEdgeToEdge()` | 让内容画到状态栏和导航栏后面 | `body { margin: 0 }` |
| `setContent { }` | 挂载 Compose UI 树 | `createRoot(document.getElementById('root')).render()` |
| `ShopTheme { }` | 包裹主题 | `<ThemeProvider>` |
| `MainScreen()` | 渲染根组件 | `<App />` |

---

## 第三步：ShopTheme 主题

> 相当于 H5 的全局样式 + CSS 变量。

**涉及文件：** `ShopTheme.kt`、`Color.kt`、`Typography.kt`

```kotlin
@Composable
fun ShopTheme(content: @Composable () -> Unit) {
    // 根据系统设置选 light/dark 色板
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    // 设置状态栏图标颜色（深色主题用浅色图标，反之亦然）
    SideEffect {
        WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
    }

    // MaterialTheme 是 Compose 的主题容器
    MaterialTheme(
        colorScheme = colorScheme,    // ≈ CSS variables（--primary, --secondary...）
        typography = ShopTypography,  // ≈ font-family / font-size 定义
        content = content,            // 所有子组件都能通过 MaterialTheme.colorScheme.xxx 拿到颜色
    )
}
```

`MaterialTheme` 的作用和 CSS 变量一样——在任何子组件中都可以通过 `MaterialTheme.colorScheme.primary` 等访问主题色，不需要手动传参。

---

## 第四步：MainScreen 页面骨架

> 相当于 H5 的 `root-layout.tsx`，定义了"顶栏 + 内容区 + 底栏"的布局结构。

**涉及文件：** `MainScreen.kt`

```kotlin
@Composable
fun MainScreen() {
    // ① 创建路由控制器（≈ createBrowserRouter()）
    val navController = rememberNavController()

    // ② 监听当前路由，判断是否显示底栏
    val currentDestination = navBackStackEntry?.destination
    val showBottomBar = currentDestination 是 Home/Profile/Cart/Menu 之一

    // ③ Scaffold = 页面骨架（≈ <div class="layout">）
    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                // ④ 条件渲染底栏（≈ {showNav && <BottomNav />}）
                BottomNavBar(...)
            }
        },
    ) { innerPadding ->
        // ⑤ Scaffold 算好底栏高度，通过 innerPadding 告诉内容区要留多少空间
        AppNavGraph(
            navController = navController,
            modifier = Modifier.padding(innerPadding),  // 内容不被底栏遮挡
        )
    }
}
```

**Scaffold 的核心机制：**

Scaffold 会先测量 `bottomBar` 的高度，然后计算出 `innerPadding`，传给内容区。内容区用 `Modifier.padding(innerPadding)` 避免被底栏遮挡。这和 H5 中给 `main` 设 `padding-bottom: 底栏高度` 是一样的道理，只是 Scaffold 自动帮你算了。

---

## 第五步：AppNavGraph 路由表

> 相当于 H5 的 `router.tsx`。

**涉及文件：** `AppNavGraph.kt`

```kotlin
NavHost(
    navController = navController,
    startDestination = HomeRoute,  // ≈ { path: '/', redirect: '/home' }
) {
    // Tab 页面
    composable<HomeRoute> { HomeScreen() }              // ≈ { path: '/home', element: <Home /> }
    composable<ProfileRoute> { ProfileScreen() }        // ≈ { path: '/me', element: <Profile /> }
    composable<CartRoute> { CartScreen() }              // ≈ { path: '/cart', element: <Cart /> }
    composable<MenuRoute> { MenuScreen() }              // ≈ { path: '/menu', element: <Menu /> }

    // 独立页面
    composable<LoginRoute> { LoginScreen(...) }                     // ≈ { path: '/login' }
    composable<RegisterRoute> { RegisterScreen(...) }               // ≈ { path: '/register' }
    composable<ProductDetailRoute> { ProductDetailScreen(...) }     // ≈ { path: '/dp/:id' }
    // ...
}
```

**路由定义方式对比：**

```
H5:    { path: '/dp/:id', element: <ProductDetail /> }
Android: @Serializable data class ProductDetailRoute(val productId: String)
         composable<ProductDetailRoute> { ProductDetailScreen() }
```

Android 用 `@Serializable` data class 定义路由参数，编译期类型安全，不会出现 H5 中 `params.id` 拼写错误的问题。

---

## 第六步：显示首页

```
NavHost startDestination = HomeRoute
  ↓
渲染 HomeRoute 对应的 composable
  ↓
当前是 Tab 页面 → showBottomBar = true → 底栏显示
  ↓
用户看到：首页内容 + 底部导航栏
```

---

## 完整流程一句话总结

```
点击图标
  → ShopApp（@HiltAndroidApp 注册 DI 容器）
    → MainActivity.onCreate()
      → setContent { ShopTheme { MainScreen() } }
        → MainScreen: navController + Scaffold
          → bottomBar: BottomNavBar（Column { Divider + NavigationBar }）
          → content: AppNavGraph（NavHost）
            → startDestination = HomeRoute
              → 渲染首页
```

---

## BottomNavBar 布局空间详解

### 整体屏幕布局

```
┌──────────────────────────────┐
│         状态栏 (~24dp)        │  ← 系统提供
├──────────────────────────────┤
│                              │
│                              │
│     AppNavGraph 内容区        │  ← Modifier.padding(innerPadding)
│                              │     保证不被顶部和底部遮挡
│     实际可用高度 =             │
│     屏幕 - 状态栏 - 底栏      │
│       - 系统导航栏            │
│                              │
├──────────────────────────────┤
│  ─── HorizontalDivider 1dp  │  ← Column {
│  ┌──────────────────────────┐│      HorizontalDivider()   // 1dp 分割线
│  │    NavigationBar ~80dp   ││      NavigationBar()        // Material3 默认 ~80dp
│  │  🏠    👤    🛒    ☰    ││    }
│  └──────────────────────────┘│
├──────────────────────────────┤    总计底栏高度 ≈ 81dp
│      系统导航栏 (~48dp)       │  ← 系统提供（手势导航更小，约 16dp）
└──────────────────────────────┘
```

### NavigationBar 内部结构（~80dp）

```
┌──────────────────────────────────────────────────────┐
│  12dp 上内边距                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │  24dp  │  │  24dp  │  │  24dp  │  │  24dp  │    │  图标行 24dp
│  │  icon  │  │  icon  │  │  icon  │  │  icon  │    │
│  └────────┘  └────────┘  └────────┘  └────────┘    │
│                                                      │
│    Home        You        Cart       Menu            │  文字行 ~16dp (12sp)
│                                                      │
│  16dp 下内边距                                        │
├──────────────────────────────────────────────────────┤
│  总计: 12 + 24 + 4(间距) + 16 + 16 ≈ 80dp（Material3 默认）  │
└──────────────────────────────────────────────────────┘
```

### Scaffold 测量过程

1. Scaffold **先测量** `bottomBar` → 得到 BottomNavBar 高度 ≈ 81dp（1dp 分割线 + 80dp NavigationBar）
2. 加上系统导航栏 inset → 总 bottom padding ≈ 81dp + 48dp = 129dp
3. 把这个值放进 `innerPadding.calculateBottomPadding()`
4. 内容区 `AppNavGraph` 应用 `Modifier.padding(innerPadding)` → 底部留出 129dp
5. 底栏和内容区**不重叠**

### 之前 Bug 的原因

```
修复前：NavigationBar(modifier = Modifier.height(56.dp))
  → 56dp 空间里塞 80dp 的内容 → 顶部 24dp 被裁掉（图标不完整）

修复后：NavigationBar()  // 不设固定高度
  → Material3 自动用 ~80dp → 图标完整显示
```

---

## H5 vs Android 启动流程对照图

```
═══════ H5 ═══════                    ═══════ Android ═══════

index.html                            AndroidManifest.xml
  ↓                                     ↓
main.tsx                              ShopApp.kt (@HiltAndroidApp)
  ↓                                     ↓
createRoot().render(<App />)          MainActivity.onCreate() → setContent {}
  ↓                                     ↓
<ThemeProvider>                       ShopTheme { }
  ↓                                     ↓
<RootLayout>                          MainScreen() → Scaffold
  ├── <BottomNav />                     ├── BottomNavBar
  └── <RouterView />                    └── AppNavGraph (NavHost)
        ↓                                    ↓
      router.tsx                          Route.kt + composable<XxxRoute>
        ↓                                    ↓
      <HomePage />                        HomeScreen()
```
