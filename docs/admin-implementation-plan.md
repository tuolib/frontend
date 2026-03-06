# Admin 后台管理系统 — 实现计划

> 企业级电商平台管理后台，使用 React 19 + Ant Design 5 + UnoCSS 构建。

---

## 现状总结

### 已完成（基础设施）

- 路由配置（React Router v7，懒加载 + 路由守卫）
- 布局组件（Sider 侧边栏 + Header 顶部导航）
- 认证守卫（RequireAuth / GuestOnly）
- API Client（`@fe/api-client` 的 admin domain）
- 共享类型、hooks、UI 组件

### 已完成（业务页面）

- Step 1：登录页（含首次改密流程）
- Step 2：管理员管理（后台人员 CRUD，超管专属）— 待实施
- Step 3：用户管理（C 端客户列表 + 详情 + 封禁/解封）
- Step 4：分类管理（树形表格、CRUD Modal、启用/禁用/删除）

### 未完成

Step 2、Step 5-11 待实施。

### 可用 Admin API 接口

| 接口 | 路径 | 状态 |
|------|------|------|
| adminProduct.create() | POST /v1/admin/product/create | 已定义 |
| adminProduct.update() | POST /v1/admin/product/update | 已定义 |
| adminProduct.remove() | POST /v1/admin/product/delete | 已定义 |
| adminProduct.createSku() | POST /v1/admin/product/sku/create | 已定义 |
| adminProduct.updateSku() | POST /v1/admin/product/sku/update | 已定义 |
| adminCategory.create() | POST /v1/admin/category/create | 已定义 |
| adminCategory.update() | POST /v1/admin/category/update | 已定义 |
| adminOrder.list() | POST /v1/admin/order/list | 已定义 |
| adminOrder.ship() | POST /v1/admin/order/ship | 已定义 |
| adminStock.adjust() | POST /v1/admin/stock/adjust | 已定义 |

公共接口（无需 admin 前缀）也可在后台使用：`product.list()`、`product.detail()`、`category.tree()`、`order.detail()` 等。

---

## 实施顺序

```
系统管理    Step 1 (Login) -> Step 2 (Staff Mgmt) -> Step 3 (User Mgmt)
基础数据    Step 4 (Category)
商品管理    Step 5 (Product List) -> Step 6 (Product Create) -> Step 7 (Product Edit)
订单管理    Step 8 (Order List) -> Step 9 (Order Detail)
运营总览    Step 10 (Dashboard) -> Step 11 (Stock Adjust)
```

> Step 1 / 3 / 4 已完成。Step 2 (管理员管理) 仅超级管理员可访问。

---

## Step 1: 登录页

**文件：** `pages/auth/login.tsx`
**状态：** [x] 已完成

### 功能清单

- [x] Ant Design Form 登录表单（username + password）
- [x] 表单校验：用户名非空、密码非空
- [x] 调用 admin auth login 接口
- [x] 登录成功后存储 token（通过 useAuthStore）
- [x] 首次登录强制改密流程（mustChangePassword）
- [x] 登录后重定向至之前页面或 Dashboard
- [x] 错误提示：message.error 显示后端错误信息
- [x] Loading 状态防止重复提交

### UI 设计

- 居中卡片布局（AuthLayout 已提供）
- 标题："后台管理系统"
- 输入框带前缀图标（用户、锁）
- "登录" 按钮全宽

### API

- `POST /api/v1/admin/auth/login` — { username, password } -> { admin, accessToken, mustChangePassword }
- `POST /api/v1/admin/auth/change-password` — { oldPassword, newPassword }

---

## Step 2: 管理员管理（后台人员）

**文件：** `pages/staff/list.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 1
**权限要求：** 超级管理员（`isSuper: true`）

> **设计说明：** 后台管理员与 C 端用户是完全独立的两套体系——不同数据表（`admins` vs `users`）、不同认证方式（username vs email）、不同 API 前缀（`/admin/manage/*` vs `/admin/user/*`）、不同权限要求（仅超管 vs 所有管理员）。管理员有角色体系（admin/operator/viewer），由超级管理员统一管理。非超级管理员不应看到此菜单。

### 功能清单

- [ ] 管理员列表：`adminManage.list()` 分页展示
  - 列：用户名、姓名、角色、状态、手机号、邮箱、最后登录、创建时间、操作
  - 搜索：按用户名关键词
  - 角色标签颜色：admin=blue、operator=green、viewer=default
  - 状态标签：active=green "正常"、disabled=red "已禁用"
  - 超级管理员行特殊标识（如 crown 图标或"超管"标签）
- [ ] 创建管理员：Modal 弹窗表单
  - 用户名（必填，2-50 字符，字母/数字/下划线/短横线）
  - 初始密码（必填，8-100 字符）
  - 姓名（选填）、手机号（选填）、邮箱（选填）
  - 角色（Select：admin / operator / viewer，默认 operator）
  - 提示：新管理员首次登录需修改密码
- [ ] 编辑管理员：Modal 弹窗表单，预填数据
  - 可修改：姓名、手机号、邮箱、角色
  - 不可修改：用户名（展示但禁用）
  - 超级管理员不可编辑
- [ ] 启用/禁用管理员：`adminManage.toggleStatus(id, status)`
  - 超级管理员不可禁用
  - Popconfirm 确认
- [ ] 重置密码：`adminManage.resetPassword(id, newPassword)`
  - Modal 输入新密码（8-100 字符）
  - 超级管理员不可重置
  - 成功提示：该管理员下次登录需修改密码
- [ ] 菜单可见性：侧边栏"管理员管理"菜单项仅超级管理员可见

### UI 设计

- 页面顶部："管理员管理" 标题 + "新建管理员" 按钮
- 数据表格 + 粘性底部分页器（与用户管理风格一致）
- Modal 表单宽度 520px
- 操作列：编辑、启用/禁用、重置密码（超级管理员行隐藏操作按钮）

### API

- `POST /api/v1/admin/manage/list` — 管理员列表
- `POST /api/v1/admin/manage/create` — 创建管理员
- `POST /api/v1/admin/manage/update` — 更新管理员
- `POST /api/v1/admin/manage/toggle-status` — 启用/禁用
- `POST /api/v1/admin/manage/reset-password` — 重置密码

### 实现注意事项

1. **API Client 新增：** `@fe/api-client` 中添加 `adminManage` domain
2. **类型新增：** `@fe/shared` 中添加 `StaffListItem` 类型
3. **路由新增：** `/staff` 路径，懒加载 `pages/staff/list`
4. **侧边栏条件渲染：** 读取 `useAuthStore` 中的 `admin.isSuper`，仅超管显示菜单
5. **前端路由守卫（可选）：** 非超管直接访问 `/staff` 时重定向到首页

---

## Step 3: 用户管理（C 端客户）

**文件：** `pages/user/list.tsx`、`pages/user/detail.tsx`
**状态：** [x] 已完成
**前置依赖：** Step 1

> **设计说明：** C 端用户（消费者）与后台管理员完全隔离。所有管理员均可查看和管理 C 端用户。

### 功能清单

- [x] 用户列表：`adminUser.list()` 分页展示
  - 列：头像+昵称/邮箱、手机号、状态、最后登录、注册时间、操作
  - 搜索：按邮箱/昵称关键词
  - 筛选：状态（正常/已封禁）
- [x] 用户详情页：`adminUser.detail(id)` 展示完整信息
  - 基本信息：头像、昵称、邮箱、手机号、状态、注册时间、最后登录
  - 订单统计：总订单数、已付款订单数、消费总额
  - 收货地址列表
- [x] 封禁/解封：`adminUser.toggleStatus(id, status)`

### UI 设计

- 列表页：搜索框 + 状态筛选 + 数据表格 + 粘性底部分页器
- 详情页：返回按钮 + 用户信息卡片 + 订单统计卡片 + 收货地址表格

### API

- `POST /api/v1/admin/user/list` — 用户列表
- `POST /api/v1/admin/user/detail` — 用户详情
- `POST /api/v1/admin/user/toggle-status` — 封禁/解封

---

## Step 4: 分类管理

**文件：** `pages/category/list.tsx`
**状态：** [x] 已完成
**前置依赖：** Step 1

### 功能清单

- [x] 分类树展示（Ant Design Table + expandable rows）
- [x] 加载数据：`adminCategory.tree()` 获取层级结构
- [x] 创建分类：Modal 弹窗表单
  - 名称（必填）、slug（可选）、父分类（TreeSelect）、图标 URL、排序
- [x] 编辑分类：Modal 弹窗表单，预填数据
- [x] 启用/禁用切换：`adminCategory.update({ id, isActive })`
- [x] 删除分类：`adminCategory.remove(id)`
- [x] 操作列：编辑、启用/禁用、删除

### UI 设计

- 页面顶部："分类管理" 标题 + "新建分类" 按钮
- 树形表格列：名称、Slug、图标、排序、状态、操作
- Modal 表单宽度 520px

### API

- `POST /api/v1/admin/category/tree` — 获取分类树
- `POST /api/v1/admin/category/create` — 创建分类
- `POST /api/v1/admin/category/update` — 更新分类
- `POST /api/v1/admin/category/delete` — 删除分类

---

## Step 5: 商品列表

**文件：** `pages/product/list.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 1

### 功能清单

- [ ] Ant Design Table 数据表格
  - 列：主图缩略图、标题、品牌、状态、价格区间、销量、创建时间、操作
- [ ] 分页：`adminProduct.list()` with page/pageSize
- [ ] 筛选：状态（draft/active/archived）、分类（TreeSelect）、品牌（输入）
- [ ] 排序：创建时间、价格、销量
- [ ] 搜索：关键词输入框
- [ ] 操作列：编辑（跳转）、上架/下架（状态切换）、删除（Popconfirm）
- [ ] "新建商品" 按钮跳转 `/product/create`
- [ ] 状态标签：draft=灰色、active=绿色、archived=红色

### UI 设计

- 顶部工具栏：搜索框 + 筛选器 + "新建商品" 按钮
- 表格带 loading 状态
- 分页器底部居右

### API

- `POST /api/v1/admin/product/list` — 分页列表（含筛选排序搜索）
- `POST /api/v1/admin/product/toggle-status` — 状态切换
- `POST /api/v1/admin/product/delete` — 删除商品

---

## Step 6: 商品创建

**文件：** `pages/product/create.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 4（需要分类数据）

### 功能清单

- [ ] Ant Design Form 商品表单
  - 标题（必填，1-200 字符）
  - Slug（可选，自动生成提示）
  - 描述（TextArea）
  - 品牌（可选，最长 100 字符）
  - 状态（Select：draft / active，默认 draft）
  - 分类（TreeSelect 多选，至少 1 个）
- [ ] 图片管理区
  - 动态列表：URL 输入 + 替代文本 + 是否主图 + 排序
  - 添加/删除图片行
- [ ] 自定义属性（可选）
  - 动态 key-value 表单行
- [ ] 表单校验
- [ ] 提交：`adminProduct.create()` -> 成功后跳转编辑页
- [ ] 取消按钮返回列表

### UI 设计

- Card 分区：基本信息、分类、图片、属性
- 底部固定操作栏：取消 + 保存草稿 + 发布

### API

- `POST /api/v1/admin/product/create`
- `POST /api/v1/admin/category/tree` — 获取分类供选择

---

## Step 7: 商品编辑

**文件：** `pages/product/edit.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 6

### 功能清单

- [ ] 路由参数获取商品 ID
- [ ] 加载商品详情：`adminProduct.detail(id)` 填充表单
- [ ] 商品信息编辑表单（复用 Step 6 的表单结构，可抽取公共组件）
- [ ] SKU 管理区
  - [ ] 展示已有 SKU 列表（Table）
  - [ ] 创建 SKU：Modal 表单 — skuCode、price、comparePrice、costPrice、stock、lowStock、weight、attributes（key-value）、barcode
  - [ ] 编辑 SKU：Modal 表单预填
  - [ ] SKU 状态切换（active/inactive）
- [ ] 删除商品：Popconfirm -> `adminProduct.remove(id)` -> 跳转列表
- [ ] 保存：`adminProduct.update()`
- [ ] Loading / 404 处理

### UI 设计

- Tabs 或 Card 分区：商品信息 | SKU 管理
- SKU 表格列：编码、价格、划线价、库存、规格属性、状态、操作

### API

- `POST /api/v1/admin/product/detail` — 加载商品（含 images、skus、categories）
- `POST /api/v1/admin/product/update` — 更新商品
- `POST /api/v1/admin/product/sku/create` — 创建 SKU
- `POST /api/v1/admin/product/sku/update` — 更新 SKU
- `POST /api/v1/admin/product/delete` — 删除商品

---

## Step 8: 订单列表

**文件：** `pages/order/list.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 1

### 功能清单

- [ ] Ant Design Table 数据表格
  - 列：订单号、用户 ID、总金额、状态、下单时间、操作
- [ ] 分页：`adminOrder.list()` with page/pageSize
- [ ] 状态筛选：Tabs 或 Select
  - 全部 | pending | paid | shipped | delivered | completed | cancelled | refunded
- [ ] 操作列：查看详情（跳转）、发货（paid 状态显示）
- [ ] 状态标签颜色映射
  - pending=orange、paid=blue、shipped=cyan、delivered=green、completed=green、cancelled=gray、refunded=red
- [ ] 快捷发货：点击后弹 Modal 输入物流单号

### UI 设计

- 顶部状态 Tabs + 搜索框
- 表格金额列右对齐
- 分页器底部居右

### API

- `POST /api/v1/admin/order/list` — 管理员订单列表
- `POST /api/v1/admin/order/ship` — 发货

---

## Step 9: 订单详情

**文件：** `pages/order/detail.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 8

### 功能清单

- [ ] 路由参数获取订单 ID
- [ ] 加载订单详情：`adminOrder.detail(orderId)`
- [ ] 订单状态流程：Ant Design Steps 组件
  - 创建 -> 已支付 -> 已发货 -> 已送达 -> 已完成
- [ ] 订单信息卡片：订单号、状态、金额、备注、创建时间、过期时间
- [ ] 商品列表：Table — 商品名、SKU 属性、主图、单价、数量、小计
- [ ] 收货地址：Descriptions 展示
- [ ] 操作按钮
  - [ ] 发货（paid 状态）：Modal 输入物流单号
  - [ ] 取消订单（pending/paid 状态）
- [ ] 金额汇总：总金额、实付金额

### UI 设计

- 页面顶部：返回按钮 + 订单号 + 状态标签
- Card 分区：订单状态流程 | 商品列表 | 收货地址 | 金额信息
- 操作按钮放页面顶部右侧

### API

- `POST /api/v1/admin/order/detail` — 订单详情
- `POST /api/v1/admin/order/ship` — 发货
- `POST /api/v1/admin/order/cancel` — 取消订单
- `POST /api/v1/admin/order/refund` — 退款

---

## Step 10: Dashboard 仪表盘

**文件：** `pages/dashboard/index.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 5, Step 8（需要商品和订单数据）

### 功能清单

- [ ] 统计卡片（Ant Design Statistic + Card）
  - 商品总数（`adminProduct.list({ pageSize: 1 })` 取 pagination.total）
  - 订单总数（`adminOrder.list({ pageSize: 1 })` 取 pagination.total）
  - 待处理订单数（status=pending）
  - 待发货订单数（status=paid）
- [ ] 近期订单表格：最新 5 条订单
- [ ] 快捷操作入口
  - 创建商品、管理分类、处理订单、调整库存

### UI 设计

- 顶部 4 个统计卡片（Row + Col 栅格）
- 中部近期订单迷你表格
- 底部快捷入口按钮组

### API

- `POST /api/v1/admin/product/list` — { pageSize: 1 } 取商品总数
- `POST /api/v1/admin/order/list` — 取订单统计 + 近期订单

---

## Step 11: 库存调整

**文件：** `pages/stock/adjust.tsx`
**状态：** [ ] 未开始
**前置依赖：** Step 7（需要 SKU 数据）

### 功能清单

- [ ] SKU 搜索选择
  - 输入商品名关键词 -> `product.search()` -> 选择商品 -> `product.skuList()` -> 选择 SKU
  - 或直接输入 SKU 编码搜索
- [ ] 展示选中 SKU 信息：商品名、SKU 编码、规格属性、当前库存、低库存阈值
- [ ] 调整表单
  - 新库存数量（InputNumber，>=0）
  - 调整原因（TextArea，可选）
- [ ] 提交：`adminStock.adjust()` -> 成功提示
- [ ] 调整记录列表（如后端支持）

### UI 设计

- 上半部分：搜索区 + SKU 信息展示
- 下半部分：调整表单
- 成功后清空表单，可继续调整

### API

- `POST /api/v1/product/search` — 搜索商品
- `POST /api/v1/product/sku/list` — 获取 SKU 列表
- `POST /api/v1/admin/stock/adjust` — 调整库存

---

## 公共组件计划

在实施过程中可能需要抽取的公共组件（按需创建，不提前过度设计）：

| 组件 | 说明 | 时机 |
|------|------|------|
| ProductForm | 商品表单（Create/Edit 复用） | Step 7 实施时抽取 |
| OrderStatusTag | 订单状态彩色标签 | Step 8 实施时创建 |
| SkuFormModal | SKU 创建/编辑弹窗 | Step 7 实施时创建 |
| CategoryTreeSelect | 分类树选择器 | Step 6 实施时创建（如 Step 4 和 Step 6 都需要） |

---

## 注意事项

1. **Admin 使用 Ant Design 组件**，不使用 `@fe/ui` 的 H5 组件
2. **UnoCSS 仅用于布局辅助**（flex、margin、padding），不用于替代 Ant Design 样式
3. **Admin 不需要 rem 适配**，直接使用 px
4. **所有 API 调用通过 `@fe/api-client`**，不直接使用 ky
5. **列表数据不存 store**，页面级直接请求
6. **认证状态使用 `@fe/hooks` 的 `useAuthStore`**
