# CLAUDE.md — 前端项目约定 & AI 协作指南

> **Claude Code CLI 会自动读取此文件。所有会话必须遵守以下约定。**

---

## 项目概述

企业级电商平台前端 Monorepo，包含 H5 移动端商城和 Admin 后台管理系统。
与后端项目 `~/my-backend` 配合，通过 RESTful API 通信。

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| Runtime | Bun | 包管理 + 脚本运行 |
| 构建编排 | Turborepo | 增量构建 |
| 框架 | React 19 + Vite 8 beta | Rolldown 内置打包 |
| 路由 | React Router v7 | SPA 客户端路由 |
| 状态管理 | Zustand 5 | 按域拆分 store |
| HTTP 客户端 | ky | Token 拦截 + 刷新 |
| 样式 | UnoCSS + SCSS | 原子类 + SCSS 全局/模块样式 |
| Admin UI | Ant Design 5 | 中文本地化 |
| Linter | oxlint 1.0 | Rust 高性能 |
| Formatter | oxfmt | Rust 高性能 |

## Monorepo 结构

```
apps/h5/                    # H5 移动端商城 :5173
apps/admin/                 # Admin 后台管理 :5174
packages/shared/            # @fe/shared — 类型、常量、工具函数
packages/api-client/        # @fe/api-client — 后端 API 调用层
packages/ui/                # @fe/ui — 共享 React 组件库
packages/hooks/             # @fe/hooks — 共享 React hooks
docs/                       # 架构文档 + API 参考
```

## 后端 API 参考

**重要：** 后端 API 详细文档在 `docs/api-reference.md`。
编写 API 调用代码时必须参考此文件，确保请求/响应类型与后端一致。

后端项目位于 `~/my-backend`，如需查看实现细节可读取该目录下的代码。

### API 通信规则

- **全部使用 POST**，参数通过 JSON Body 传递
- 路由格式：`POST /api/v1/{domain}/{action}`
- 统一响应格式：`{ code, success, data, message, traceId }`
- 认证方式：`Authorization: Bearer <accessToken>`
- 幂等性：订单/支付需携带 `X-Idempotency-Key` header

## 编码规范

### 命名

- 文件名：`kebab-case.ts/tsx`（例：`product-card.tsx`）
- 类型/接口：`PascalCase`（例：`ProductDetail`）
- 函数/变量：`camelCase`（例：`formatPrice`）
- 常量：`UPPER_SNAKE_CASE`（例：`ERROR_CODE.STOCK_INSUFFICIENT`）
- React 组件：`PascalCase`（例：`ProductCard`）
- Hooks：`camelCase` 以 `use` 开头（例：`useAuthStore`）

### 导入路径

使用 workspace 别名，禁止相对路径跨包引用：

```typescript
// ✅ 正确
import { ERROR_CODE } from '@fe/shared';
import { auth, ApiError } from '@fe/api-client';
import { Button, Price } from '@fe/ui';
import { useAuthStore } from '@fe/hooks';

// ❌ 错误
import { ERROR_CODE } from '../../packages/shared/src/constants';
```

### 导出规范

每个 package 通过 `src/index.ts` 统一导出：

```typescript
// ✅ 正确
import { Button } from '@fe/ui';

// ❌ 错误
import { Button } from '@fe/ui/src/button';
```

### App 内部路径

App 内部使用 `@/` 别名：

```typescript
// ✅ apps/h5 内部
import { ProductCard } from '@/components/product-card';
```

### 组件分层

```
apps/{app}/src/
  ├── pages/           # 页面组件（路由级别）
  ├── layouts/         # 布局组件（Header/Footer/Sidebar）
  ├── components/      # App 特有业务组件
  └── styles/          # 全局样式
packages/ui/src/       # 跨 App 共享的通用组件
packages/hooks/src/    # 跨 App 共享的 hooks
```

### 状态管理

- 使用 Zustand，按域拆分 store（不用单一全局 store）
- 共享 store（如 auth）放在 `@fe/hooks`
- App 特有 store 放在 App 内部
- 列表数据（商品、订单）不存全局 store，按页面直接请求

### 错误处理

- API 错误使用 `ApiError` 类（from `@fe/api-client`）
- 通过 `err.is(ERROR_CODE.XXX)` 进行类型安全的错误匹配
- 401 由 API client 自动处理（token 刷新或登出）
- 业务错误在页面层展示 toast 提示

### 样式

- 使用 UnoCSS 原子类（preset-wind 兼容 Tailwind 语法）
- 样式文件使用 `.scss` 格式（sass-embedded）
- H5 rem 适配：设计稿 375px，1rem = 100px，`clamp(85.33px, calc(100vw / 3.75), 144px)`
  - 换算：设计稿 Npx → 代码 N/100 rem（如 32px → 0.32rem）
- Admin：Ant Design 组件 + UnoCSS 布局辅助类
- 禁止内联 style（除动态计算值外）

## 开发命令

```bash
bun run dev           # 启动所有 app
bun run dev:h5        # 仅启动 H5 :5173
bun run dev:admin     # 仅启动 Admin :5174
bun run build         # 构建所有 app
bun run type-check    # 全量类型检查
bun run lint          # oxlint 检查
bun run format        # oxfmt 格式化
bun run format:check  # oxfmt 格式检查
```

## 测试

- 测试框架：`vitest`（后续引入）
- 测试文件：与源码同目录，命名 `*.test.ts/tsx`
- 组件测试：使用 `@testing-library/react`

## Claude Code 协作规则

### 每个会话的开始

1. 读取 `CLAUDE.md`（自动）
2. 需要了解后端接口时，读取 `docs/api-reference.md`
3. 检查已完成的代码，理解现有实现
4. 只做当前任务的工作，不越界

### 代码生成要求

- 先写类型定义，再写实现
- API 调用必须与 `docs/api-reference.md` 中的定义一致
- 组件使用 UnoCSS 原子类，禁止引入其他 CSS 框架
- Admin 页面使用 Ant Design 组件

### 禁止事项

- 不要生成 `.env` 文件（使用 `.env.example`）
- 不要硬编码 API 地址（使用 `VITE_API_BASE_URL`）
- 不要引入未在技术栈中列出的依赖（需先讨论）
- 不要直接操作 `localStorage`（使用 `@fe/shared` 的 storage 工具）
- 不要在组件中直接调用 `ky`（使用 `@fe/api-client` 的 domain modules）
- 不要信任 URL 参数作为金额或数量（服务端会重新校验，但前端也要做基本校验）
