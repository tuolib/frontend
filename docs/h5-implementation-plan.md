# H5 Amazon 风格实现计划

> Claude Code 每次新会话实现 H5 页面时，请先阅读此文档了解整体规划和当前进度。

## 设计参考

模仿 **Amazon Shopping App** 的移动端 H5 风格，而非京东。
核心特征：深色顶栏（`#131921`）、橙色强调（`#ff9900`）、简洁商品卡片、持久搜索栏。

---

## 设计 Token

```
主色（顶栏/深色背景）：#131921
强调色（按钮/链接）：  #ff9900
强调色 hover：        #e68a00
价格色：              #b12704
Prime 蓝：            #007185
成功色：              #067d62
背景灰：              #eaeded
卡片白：              #ffffff
文字主色：            #0f1111
文字次色：            #565959
分割线：              #ddd / #eaeded
星标色：              #ffa41c
```

## 底部导航栏（4 Tab）

参考 Amazon App 真实布局：

```
┌────────┬────────┬────────┬────────┐
│  🏠    │  👤    │  🛒    │   ≡    │
│  Home  │  You   │  Cart  │  Menu  │
└────────┴────────┴────────┴────────┘
```

- **Home** `/` — 首页，商品推荐
- **You** `/me` — 我的，订单/地址/账号
- **Cart** `/cart` — 购物车
- **Menu** `/menu` — 分类浏览（新增页面）

> 搜索不是 Tab，而是**首页顶部常驻搜索栏**，点击跳转 `/search` 独立页面。

---

## 路由结构

```
Tab 页面（RootLayout 包裹，显示底部导航）:
  /              → Home 首页
  /me            → You 我的
  /cart           → Cart 购物车（需登录）
  /menu           → Menu 分类浏览（新增）

独立页面（无底部导航）:
  /search         → 搜索页
  /product?categoryId=xxx → 商品列表
  /product/:id    → 商品详情
  /order/create   → 订单确认
  /order          → 订单列表
  /order/:id      → 订单详情
  /order/:id/pay  → 支付页
  /me/address     → 地址管理
  /login          → 登录
  /register       → 注册
```

---

## 实现步骤

共 8 步，每步可独立验证。标注 `[x]` 为已完成，`[ ]` 为待实现。

---

### Step 1 — 基础框架改造 `[x]`

> 改造全局风格和导航框架，后续所有页面在此基础上开发。

**文件清单：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `layouts/root-layout.tsx` | 重写 | 4-tab Amazon 底栏 + 深色顶部搜索栏 |
| `styles/globals.scss` | 修改 | Amazon 主题色、全局字体 |
| `router.tsx` | 修改 | 新增 `/menu` 路由，调整 tab 结构 |
| `pages/menu/index.tsx` | 新建 | 空壳占位，Step 4 实现 |
| `pages/home/home.scss` | 重写 | 删除京东样式，Amazon 风格 |
| `pages/home/placeholder.ts` | 修改 | Amazon 配色 |

**底部导航组件规格：**
- 高度：50px（设计稿），白色背景，顶部 1px `#ddd` 分割线
- 图标：22px，Carbon icons
- 文字：10px
- 激活色：`#007185`（Amazon teal），非激活：`#565959`
- Cart tab 右上角显示数量 badge（橙色圆点）

**顶部搜索栏规格（仅首页显示）：**
- 背景：`#131921` → `#232f3e` 渐变
- 搜索框：白色圆角，左侧搜索图标，placeholder "Search"
- 搜索框下方：`📍 Deliver to Alice — Shanghai` 地址条（浅色文字）
- 点击搜索框 → navigate('/search')

**验收标准：**
- [x] 4 个 Tab 可切换，路由正确
- [x] 搜索栏显示在首页顶部
- [x] 整体色调为 Amazon 深蓝+白色
- [x] 移动端 rem 适配正常

---

### Step 2 — 首页 Home `[x]`

> 用户打开 App 看到的第一个页面。

**文件：** `pages/home/index.tsx`, `pages/home/home.scss`

**页面结构（从上到下）：**

```
┌─────────────────────────────────┐
│ [搜索栏 — 在 RootLayout 中]     │
│ 📍 Deliver to Alice — Shanghai  │
├─────────────────────────────────┤
│ [分类横滑胶囊]                   │
│ 数码 | 服饰 | 食品 | 美妆 | ... │
├─────────────────────────────────┤
│ ┌─ Banner 轮播 ───────────────┐ │
│ │ 占位图（3张自动轮播）         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Deal of the Day                 │
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ img  │ │ img  │ │ img  │    │  横滑
│ │ -40% │ │ -25% │ │ -60% │    │
│ │ ¥599 │ │ ¥199 │ │ ¥39  │    │
│ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────┤
│ Recommended for you             │
│ ┌──────────┐ ┌──────────┐      │
│ │   img    │ │   img    │      │  2列网格
│ │ title    │ │ title    │      │  无限滚动
│ │ ¥price   │ │ ¥price   │      │
│ └──────────┘ └──────────┘      │
└─────────────────────────────────┘
```

**数据来源：**

| 区域 | API | 参数 |
|------|-----|------|
| 分类胶囊 | `category.tree` | 取一级分类 |
| Banner | 无 API | 占位图（`placeholder.ts` 生成） |
| Deal of the Day | `product.list` | `sort: 'sales', order: 'desc', pageSize: 10` |
| Recommended | `product.list` | `sort: 'createdAt', order: 'desc'` + 无限滚动 |

**组件拆分：**
- `SearchHeader` — 搜索栏 + 地址（提取为共享组件，Step 1 中写好）
- `CategoryPills` — 分类胶囊横滑
- `BannerCarousel` — 轮播图
- `DealSection` — 热销横滑
- `ProductCard` — 商品卡片（复用于列表页）
- `ProductGrid` — 2列网格 + 无限滚动

**商品卡片规格：**
- 白色圆角卡片（8px）
- 图片 1:1 比例
- 标题：最多2行，13px，`#0f1111`
- 价格：`¥` 小字 + 整数大字（17px 粗体）+ 小数（12px），颜色 `#b12704`
- 划线价（如有 comparePrice）：灰色删除线
- 销量/评论数：灰色小字

**验收标准：**
- [x] 分类胶囊可横滑，点击跳转 `/product?categoryId=xxx`
- [x] Banner 自动轮播，3秒切换
- [x] Deal 横滑区展示销量 Top 商品
- [x] 推荐商品 2 列网格无限滚动
- [x] 无真实图片时显示占位图

---

### Step 3 — 搜索页 Search `[x]`

> Amazon 的核心体验，独立全屏页面。

**文件：** `pages/product/search.tsx`

**页面结构：**

```
┌─────────────────────────────────┐
│ ← [输入框 autofocus]     取消   │
├─────────────────────────────────┤
│                                 │
│ --- 未输入时 ---                 │
│ 搜索历史                  清除   │
│ [iPhone] [耳机] [背包] ...      │
│                                 │
│ 热门搜索                        │
│ [手机] [笔记本] [零食] ...      │
│                                 │
│ --- 输入/提交后 ---              │
│ 排序: 综合 | 价格↑ | 价格↓ | 销量│
│ ┌──────┐ ┌──────┐              │
│ │ 搜索结果 2列网格              │
│ │ 无限滚动                      │
│ └──────┘ └──────┘              │
└─────────────────────────────────┘
```

**数据来源：**

| 区域 | 来源 |
|------|------|
| 搜索历史 | `@fe/shared` 的 `getStorageItem/setStorageItem` |
| 热门搜索 | 静态数据（后端无热词接口） |
| 搜索结果 | `product.search(keyword, sort, page, pageSize)` |

**交互：**
- 输入框 autofocus，键盘回车提交
- 点击历史标签 → 填入输入框并搜索
- 排序切换重新搜索（重置分页）
- 搜索历史最多保存 10 条，新的在前

**验收标准：**
- [x] 输入框自动聚焦
- [x] 搜索历史持久化（localStorage）
- [x] 搜索结果支持排序切换
- [x] 无限滚动分页

---

### Step 4 — 分类页 Menu `[ ]`

> Amazon 的 ≡ 菜单，左右分栏浏览分类。

**文件：** `pages/menu/index.tsx`（新建）

**页面结构：**

```
┌─────────────────────────────────┐
│ Menu                            │
├────────┬────────────────────────┤
│        │                        │
│ 一级   │  二级分类               │
│ 分类   │                        │
│        │  ┌──────┐ ┌──────┐    │
│ ● 数码 │  │ 手机 │ │ 耳机 │    │
│   服饰 │  └──────┘ └──────┘    │
│   食品 │  ┌──────┐              │
│   美妆 │  │智能手表│             │
│   家居 │  └──────┘              │
│   图书 │                        │
│   运动 │  [ See all 数码 → ]    │
│   母婴 │                        │
│        │                        │
├────────┴────────────────────────┤
```

**布局：**
- 左栏：固定宽度 88px，灰色背景，一级分类垂直排列
- 右栏：flex-1，二级分类网格（3列图标+文字）
- 左栏选中态：白色背景 + 左侧 3px teal 竖条
- 底部 "See all {分类名}" 链接 → `/product?categoryId=xxx`

**数据：** `category.tree` → 一次请求，前端拆分

**验收标准：**
- [ ] 左侧一级分类可切换
- [ ] 右侧显示对应二级分类
- [ ] 点击二级分类跳转商品列表
- [ ] 无图标时用 `categoryPlaceholder` 占位

---

### Step 5 — 商品列表 & 详情 `[ ]`

> 浏览 → 决策的关键链路，两个页面一起做。

#### 5a. 商品列表 `/product?categoryId=xxx`

**文件：** `pages/product/list.tsx`

```
┌─────────────────────────────────┐
│ ← 分类名称           🔍         │
├─────────────────────────────────┤
│ 排序: 综合 | 价格 | 销量 | 最新  │
├─────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐      │
│ │   img    │ │   img    │      │
│ │ title    │ │ title    │      │  复用 ProductCard
│ │ ¥price   │ │ ¥price   │      │  无限滚动
│ └──────────┘ └──────────┘      │
└─────────────────────────────────┘
```

**API：** `product.list({ categoryId, sort, order, page, pageSize })`

#### 5b. 商品详情 `/product/:id`

**文件：** `pages/product/detail.tsx`

```
┌─────────────────────────────────┐
│ ←                    🛒   ⋮     │
├─────────────────────────────────┤
│ ┌─ 图片轮播（全宽，可左右滑）─┐ │
│ │                             │ │
│ │         1 / 3               │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ¥7,999                         │ ← 价格区
│ ¥9,999 (划线价)    -20%         │
├─────────────────────────────────┤
│ iPhone 15 Pro 256GB            │ ← 标题
│ ⭐⭐⭐⭐☆ 4.5  (2000+ ratings)  │ ← 评分（mock）
├─────────────────────────────────┤
│ 规格选择                        │
│ [128GB] [256GB ✓] [512GB]      │ ← SKU 选择器
├─────────────────────────────────┤
│ About this item                 │
│ 商品描述文字...                  │
├─────────────────────────────────┤
│ ┌──────────────┬──────────────┐ │ ← 底部固定
│ │  Add to Cart │  Buy Now     │ │
│ └──────────────┴──────────────┘ │
└─────────────────────────────────┘
```

**API：**
- `product.detail(id)` — 商品信息 + 图片 + SKU 列表
- `cart.add({ skuId, quantity })` — 加入购物车

**SKU 选择器逻辑：**
- 从 `product.detail` 返回的 `skus[]` 提取属性维度
- 选中 SKU 后更新价格/库存显示
- 库存为 0 时禁用该选项

**验收标准：**
- [ ] 列表页排序切换正常
- [ ] 列表页无限滚动分页
- [ ] 详情页图片可轮播
- [ ] SKU 选择器联动价格
- [ ] 加入购物车调用 API 并 toast 提示
- [ ] 底部操作栏固定不随页面滚动

---

### Step 6 — 购物车 Cart `[ ]`

> Tab 页面，登录后显示购物车内容。

**文件：** `pages/cart/index.tsx`

```
┌─────────────────────────────────┐
│ Shopping Cart (3)               │
├─────────────────────────────────┤
│ ☑ ┌────┐ iPhone 15 Pro         │
│   │ img│ 256GB 原色钛金属       │
│   └────┘ ¥9,999       [- 1 +]  │
│                         [删除]  │
├─────────────────────────────────┤
│ ☑ ┌────┐ 运动T恤               │
│   │ img│ L 黑色                 │
│   └────┘ ¥99          [- 2 +]  │
│                         [删除]  │
├─────────────────────────────────┤
│ □ ┌────┐ 有机坚果              │  ← 未选中
│   │ img│ 大包装                 │
│   └────┘ ¥59.9        [- 1 +]  │
├─────────────────────────────────┤
│                                 │
│ Subtotal (2 items): ¥10,098    │  ← 仅计算选中项
│ ┌─────────────────────────────┐ │
│ │   Proceed to Checkout       │ │  ← 橙色按钮
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**API：**

| 操作 | API |
|------|-----|
| 加载列表 | `cart.list` |
| 修改数量 | `cart.update({ skuId, quantity })` |
| 删除商品 | `cart.remove({ skuIds })` |
| 勾选/取消 | `cart.select({ skuIds, selected })` |
| 结算预览 | `cart.checkout/preview` → 跳转 `/order/create` |

**交互：**
- 未登录时显示空状态 + "Sign in to see your cart" 按钮
- 数量修改 debounce 300ms 后调 API
- 数量改为 0 等同于删除
- 底部结算栏固定，显示选中商品小计

**验收标准：**
- [ ] 购物车列表正确渲染
- [ ] 数量增减实时更新
- [ ] 勾选/取消勾选联动小计
- [ ] 空购物车展示引导
- [ ] 点击结算跳转订单确认页

---

### Step 7 — 我的 You `[ ]`

> Amazon "Your Account" 风格的个人中心。

**文件：** `pages/user/profile.tsx`（重写）

```
┌─────────────────────────────────┐
│ Hello, Alice 👋                  │
├─────────────────────────────────┤
│ ┌────────┐ ┌────────┐          │
│ │  📦    │ │  📍    │          │  功能入口
│ │ Orders │ │Address │          │  2x2 网格
│ └────────┘ └────────┘          │
│ ┌────────┐ ┌────────┐          │
│ │  👤    │ │  ⚙️    │          │
│ │Account │ │Sign Out│          │
│ └────────┘ └────────┘          │
├─────────────────────────────────┤
│ Your Orders                     │
│ ┌──────────────────────────┐   │
│ │ #20240305... 待付款       │   │  最近 3 条订单
│ │ iPhone 15 Pro  ¥9,999    │   │
│ │ [View order]             │   │
│ └──────────────────────────┘   │
│ [See all orders →]             │
├─────────────────────────────────┤
│ Recently Viewed                 │
│ (后续实现，可先省略)             │
└─────────────────────────────────┘
```

**API：** `user.profile`, `order.list({ page: 1, pageSize: 3 })`

**验收标准：**
- [ ] 未登录 → 显示 "Sign in" 引导
- [ ] 已登录 → 显示用户名 + 功能入口
- [ ] 最近订单预览（最多3条）
- [ ] 登出功能正常

---

### Step 8 — 订单流程 `[ ]`

> 完整的下单→支付→查看链路。

#### 8a. 订单确认页 `/order/create`

**文件：** `pages/order/create.tsx`

- 收货地址选择（从 `address.list` 获取）
- 商品清单（从 `cart.checkout/preview` 获取）
- 订单金额汇总
- 底部 "Place Order" 按钮 → `order.create` + 幂等 key

#### 8b. 支付页 `/order/:id/pay`

**文件：** `pages/order/payment.tsx`

- 显示订单金额
- 支付方式选择（mock：支付宝/微信）
- "Pay Now" 按钮 → `payment.create` + 幂等 key
- 支付成功 → 跳转订单详情

#### 8c. 订单列表 `/order`

**文件：** `pages/order/list.tsx`

- Tab 切换：全部 / 待付款 / 待发货 / 待收货 / 已完成
- 订单卡片：订单号、状态、商品缩略图、金额
- 无限滚动分页
- API：`order.list({ status, page, pageSize })`

#### 8d. 订单详情 `/order/:id`

**文件：** `pages/order/detail.tsx`

- 订单状态流程条
- 收货地址
- 商品清单
- 金额明细
- 操作按钮：取消订单 / 去支付 / 确认收货（根据状态）
- API：`order.detail({ id })`

#### 8e. 地址管理 `/me/address`

**文件：** `pages/user/address.tsx`

- 地址列表
- 新增/编辑地址（弹窗表单）
- 设为默认 / 删除
- API：`address.list/create/update/delete`

**验收标准：**
- [ ] 订单确认页正确展示商品和地址
- [ ] 下单成功跳转支付
- [ ] 订单列表按状态筛选
- [ ] 订单详情信息完整
- [ ] 地址 CRUD 正常

---

## 共享组件提取计划

以下组件在多个页面复用，应写在 `apps/h5/src/components/` 中：

| 组件 | 使用页面 | 说明 |
|------|---------|------|
| `SearchHeader` | Home, 可选其他页面 | 深色搜索栏 + 地址条 |
| `ProductCard` | Home, Search, ProductList | 商品卡片（图片+标题+价格） |
| `ProductGrid` | Home, Search, ProductList | 2列网格 + 无限滚动 |
| `SortBar` | Search, ProductList | 排序切换栏 |
| `PageHeader` | 多个独立页面 | 返回箭头 + 标题 + 右侧操作 |
| `CartBadge` | RootLayout TabBar | 购物车数量角标 |
| `AddressCard` | OrderCreate, Address | 地址展示卡片 |
| `OrderCard` | OrderList, Profile | 订单摘要卡片 |

---

## 当前实现状态

| 页面 | 状态 | 备注 |
|------|------|------|
| Login `/login` | ✅ 已实现 | 完整的表单验证 + API |
| Register `/register` | ✅ 已实现 | 完整的表单验证 + API |
| Profile `/me` | ✅ 已实现 | 需重写为 Amazon 风格 (Step 7) |
| Home `/` | ✅ 已实现 | Amazon 风格 (Step 2) |
| RootLayout | ✅ 已实现 | Amazon 风格 4-Tab (Step 1) |
| Search `/search` | ✅ 已实现 | Step 3 |
| Menu `/menu` | ⚠️ 占位 | Step 1 创建占位, Step 4 实现 |
| ProductList `/product` | ❌ 占位 | Step 5a |
| ProductDetail `/product/:id` | ❌ 占位 | Step 5b |
| Cart `/cart` | ❌ 占位 | Step 6 |
| OrderCreate `/order/create` | ❌ 占位 | Step 8a |
| OrderList `/order` | ❌ 占位 | Step 8c |
| OrderDetail `/order/:id` | ❌ 占位 | Step 8d |
| Payment `/order/:id/pay` | ❌ 占位 | Step 8b |
| Address `/me/address` | ❌ 占位 | Step 8e |

---

## API 速查

所有接口均为 POST，Body JSON，详见 `docs/api-reference.md`。

| 域 | 方法 | 路径 | 说明 |
|----|------|------|------|
| category | `category.tree` | `/api/v1/category/tree` | 分类树 |
| category | `category.list` | `/api/v1/category/list` | 分类列表 |
| product | `product.list` | `/api/v1/product/list` | 商品列表（分页+排序+筛选） |
| product | `product.search` | `/api/v1/product/search` | 搜索（关键词+筛选） |
| product | `product.detail` | `/api/v1/product/detail` | 商品详情（含图片+SKU） |
| cart | `cart.list` | `/api/v1/cart/list` | 购物车列表 |
| cart | `cart.add` | `/api/v1/cart/add` | 加入购物车 |
| cart | `cart.update` | `/api/v1/cart/update` | 修改数量 |
| cart | `cart.remove` | `/api/v1/cart/remove` | 批量删除 |
| cart | `cart.select` | `/api/v1/cart/select` | 勾选/取消 |
| cart | `cart.checkout/preview` | `/api/v1/cart/checkout/preview` | 结算预览 |
| order | `order.create` | `/api/v1/order/create` | 创建订单（需幂等key） |
| order | `order.list` | `/api/v1/order/list` | 订单列表 |
| order | `order.detail` | `/api/v1/order/detail` | 订单详情 |
| order | `order.cancel` | `/api/v1/order/cancel` | 取消订单 |
| payment | `payment.create` | `/api/v1/payment/create` | 创建支付（需幂等key） |
| payment | `payment.query` | `/api/v1/payment/query` | 查询支付状态 |
| user | `user.profile` | `/api/v1/user/profile` | 用户信息 |
| address | `address.list` | `/api/v1/user/address/list` | 地址列表 |
| address | `address.create` | `/api/v1/user/address/create` | 新增地址 |
| address | `address.update` | `/api/v1/user/address/update` | 修改地址 |
| address | `address.delete` | `/api/v1/user/address/delete` | 删除地址 |

---

## 执行说明

每次新会话开始实现某个 Step 时：

1. 先读此文档，了解当前进度
2. 读 `CLAUDE.md` 确认编码规范
3. 如需了解 API 细节，读 `docs/api-reference.md`
4. 实现完成后，更新本文档中对应 Step 的 `[ ]` → `[x]`
5. 只做当前 Step 的工作，不越界
