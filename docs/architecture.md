# 前端架构总纲

## 1. 项目定位

企业级电商平台前端，对标 Amazon/淘宝级别的移动端 H5 商城和后台管理系统。
采用 Monorepo 架构，共享类型、组件、API 层，独立构建部署。

## 2. 技术选型

### 核心框架
- **React 19** — 组件化 UI 框架
- **Vite 8 beta** — 构建工具，内置 Rolldown（Rust 打包器，比 Rollup 快 10-30x）
- **React Router v7** — SPA 客户端路由

### 状态管理
- **Zustand 5** — 轻量状态管理，按域拆分 store
  - `useAuthStore` — 用户认证状态（共享）
  - `useCartStore` — 购物车数量徽标（H5）
  - 列表数据不存 store，按页面请求

### API 通信
- **ky** — HTTP 客户端，支持 hooks（interceptor 模式）
- Token 自动注入（beforeRequest）
- 401 自动刷新（afterResponse）
- 并发刷新去重（singleton Promise）

### 样式
- **UnoCSS** — 即时按需原子 CSS 引擎
  - `preset-wind` 兼容 Tailwind 语法
  - `preset-attributify` 支持属性模式
  - `preset-icons` 按需图标加载
- **Ant Design 5** — Admin 后台 UI 组件库（中文本地化）

### 工具链
- **Bun** — 包管理 + 脚本运行
- **Turborepo** — 构建编排 + 缓存
- **oxlint** — Rust 高性能 Linter（替代 ESLint）
- **oxfmt** — Rust 高性能 Formatter（替代 Prettier）
- **TypeScript 5.7** — 类型安全

> 整条工具链统一到 VoidZero 生态：Vite + Rolldown + Oxc (oxlint/oxfmt)

## 3. Monorepo 架构

```
~/my-frontend/
├── apps/
│   ├── h5/                    # H5 移动端商城 SPA
│   └── admin/                 # Admin 后台管理 SPA
├── packages/
│   ├── shared/                # 类型定义、常量、工具函数
│   ├── api-client/            # 后端 API 调用层
│   ├── ui/                    # 共享 React 组件库
│   └── hooks/                 # 共享 React hooks + Zustand stores
└── docs/                      # 架构文档 + API 参考
```

### 包命名约定
- Packages: `@fe/*`（如 `@fe/shared`, `@fe/ui`）
- Apps: `@app/*`（如 `@app/h5`, `@app/admin`）
- 与后端 `@repo/*` 命名空间区分

### 依赖关系
```
@app/h5 ──┬── @fe/hooks ──┬── @fe/api-client ── @fe/shared
           │               └── @fe/shared
           ├── @fe/ui
           └── @fe/shared

@app/admin ── (同上)
```

### Packages 不需要构建
`exports` 直接指向 `.ts` 源码，Vite 原生解析 TypeScript。
生产构建时 Vite 将 packages 源码与 app 代码一起打包。

## 4. 分层架构

### App 内部分层

```
pages/        → 路由页面组件（薄层，负责布局 + 数据组装）
layouts/      → 共享布局（TabBar、Sidebar、Header）
components/   → App 特有业务组件
```

### Package 分层

```
@fe/shared     → 类型 + 常量 + 工具函数（零依赖）
@fe/api-client → HTTP client + 域 API 模块（依赖 @fe/shared）
@fe/ui         → React 组件（依赖 React，使用 UnoCSS）
@fe/hooks      → React hooks + stores（依赖 @fe/api-client, @fe/shared）
```

## 5. API 通信架构

### 请求流程
```
页面组件
  → useXxxStore / 直接调用 api
    → @fe/api-client 域模块 (auth, product, cart, order...)
      → client.ts (ky 实例)
        → beforeRequest: 注入 Bearer token
        → POST /api/v1/{domain}/{action}
        → afterResponse: 401 → 自动刷新 token → 重试
        → 解包响应: { success, data } → 返回 data / 抛 ApiError
```

### Token 刷新流程
```
请求返回 401
  → 检查 refreshPromise（去重）
  → POST /api/v1/auth/refresh（绕过拦截器）
  → 成功 → 更新 localStorage → 重试原始请求
  → 失败 → 清除 token → 触发 onAuthExpired → 跳转登录
```

### 错误处理
```typescript
try {
  await order.create(input);
} catch (err) {
  if (err instanceof ApiError) {
    if (err.is(ERROR_CODE.STOCK_INSUFFICIENT)) {
      // 库存不足，提示用户
    }
  }
}
```

## 6. H5 移动端设计

### 路由结构
```
/                  → 首页（商品推荐、分类入口）
/product           → 商品列表
/product/:id       → 商品详情
/search            → 搜索
/cart              → 购物车
/order/create      → 创建订单（确认页）
/order             → 订单列表
/order/:id         → 订单详情
/order/:id/pay     → 支付
/me                → 个人中心
/me/address        → 地址管理
/login             → 登录
/register          → 注册
```

### 布局
- **RootLayout** — 底部 TabBar（首页、分类、购物车、我的）
- **AuthLayout** — 登录/注册页面（无 TabBar）
- 详情/支付等页面 — 无 TabBar，独立页面

### Mobile-first
- UnoCSS mobile-first 断点
- 触控友好（最小 44px 点击区域）
- Safe area insets（刘海屏适配）
- 懒加载路由（React.lazy）

## 7. Admin 后台设计

### 路由结构
```
/                  → Dashboard（数据概览）
/product           → 商品管理列表
/product/create    → 创建商品
/product/:id/edit  → 编辑商品
/category          → 分类管理
/order             → 订单管理列表
/order/:id         → 订单详情
/stock             → 库存调整
/login             → 管理员登录
```

### 布局
- **AdminLayout** — 左侧 Sidebar 菜单 + 顶部 Header + 内容区
- **AuthLayout** — 登录页（居中表单）
- 使用 Ant Design 的 `Layout` + `Menu` + `Breadcrumb`

## 8. 部署

### H5
- Vite build → dist/ → CDN 或 Nginx 静态托管
- SPA 需配置 fallback 到 index.html
- API 请求通过 Caddy 反向代理

### Admin
- 同 H5，独立构建独立部署
- 可部署到不同域名（admin.xxx.com）

### 环境变量
- `VITE_API_BASE_URL` — 后端 API 地址
- 开发环境通过 Vite proxy 转发
- 生产环境直接指向后端网关

## 9. 后续规划

- [ ] OpenAPI 自动生成 → 前端类型自动同步
- [ ] Vitest 单元/组件测试
- [ ] E2E 测试（Playwright）
- [ ] PWA 支持（离线缓存）
- [ ] 国际化（i18n）
- [ ] 暗色模式
