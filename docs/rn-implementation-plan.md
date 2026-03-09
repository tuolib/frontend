# React Native 实现计划（Amazon 级架构）

> 对标 H5 商城全部功能，一套代码产出 iOS + Android 双平台。
> 最大化复用现有 H5 代码资产（类型定义、工具函数、API 调用逻辑）。

---

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | React Native 0.79+ (New Architecture) | JSI + Fabric，接近原生性能 |
| 语言 | TypeScript 5.x | **与 H5 完全一致** |
| 路由 | Expo Router v4 | 文件系统路由，对标 Next.js / React Router |
| 状态管理 | Zustand 5 | **直接复用 H5 store 模式** |
| HTTP 客户端 | ky | **直接复用 @fe/api-client 逻辑** |
| 样式 | NativeWind 4 (Tailwind for RN) | 类 UnoCSS 原子类体验 |
| 图片 | expo-image | 高性能缓存 + 占位符 |
| 本地存储 | expo-secure-store + MMKV | Token 加密存储 + 高速 KV |
| 列表 | FlashList | Shopify 出品，替代 FlatList |
| 手势 | react-native-gesture-handler | 轮播/滑动删除 |
| 动画 | react-native-reanimated 3 | 60fps UI 线程动画 |
| 表单 | react-hook-form | 轻量表单校验 |
| 构建 | Expo (Managed) | EAS Build 云构建 |

---

## 为什么选 Expo + Expo Router？

| | 纯 RN + React Navigation | Expo + Expo Router (推荐) |
|--|--------------------------|--------------------------|
| 项目初始化 | 手动配置 Metro/Gradle/Xcode | `npx create-expo-app` 一行搞定 |
| 原生模块 | 手动 link | `expo install` 自动处理 |
| 路由方式 | 命令式导航 `navigation.navigate()` | **文件系统路由**，与 H5 Router 思维一致 |
| OTA 更新 | 需要 CodePush | EAS Update 内置 |
| 构建发布 | 本地 Xcode/Android Studio | **EAS Build 云端构建**，无需 Mac 编 iOS |
| 维护者 | Meta（精力分散） | **Expo 团队全职维护** |

---

## 代码复用分析

### 可直接复用（从 `packages/` 共享）

| 包 | 复用内容 | 改动 |
|----|---------|------|
| `@fe/shared` | 类型定义、常量、ErrorCode、工具函数 | **零改动** |
| `@fe/api-client` | API 调用层、Token 拦截、ApiError | **几乎零改动**（ky 支持 RN） |
| `@fe/hooks` | `useAuthStore`、`useRequest`、`usePaginatedRequest` | **零改动**（Zustand 跨平台） |

### 需要重写（UI 层）

| H5 | RN 替代 | 原因 |
|----|---------|------|
| `@fe/ui` 组件 | RN 原生组件 | HTML 元素 → RN `View`/`Text`/`Pressable` |
| UnoCSS + SCSS | NativeWind | CSS → StyleSheet / Tailwind |
| `<img>` | `<Image>` (expo-image) | 不同的图片组件 |
| `<input>` | `<TextInput>` | 不同的输入组件 |
| IntersectionObserver | FlashList `onEndReached` | 不同的无限滚动实现 |
| touch event 轮播 | react-native-reanimated | 不同的手势系统 |

### 复用率估算

```
类型/常量/工具    ████████████████████ 100% 复用
API 调用层       ████████████████████  95% 复用（ky 天然跨平台）
Zustand stores   ████████████████████  90% 复用（仅改 storage adapter）
Hooks            ████████████████░░░░  80% 复用
业务逻辑         ████████████████░░░░  80% 复用
UI 组件          ████░░░░░░░░░░░░░░░░  20% 复用（需要重写 View 层）

总体复用率约 60-70%，相比原生双端的 0% 复用
```

---

## 设计 Token（与 H5 / 原生保持一致）

```typescript
// theme/colors.ts — 与 H5 globals.scss 完全一致
export const colors = {
  primary: '#131921',
  accent: '#FF9900',
  accentPressed: '#E68A00',
  price: '#B12704',
  teal: '#007185',
  success: '#067D62',
  background: '#EAEDED',
  card: '#FFFFFF',
  text: '#0F1111',
  textSecondary: '#565959',
  divider: '#DDDDDD',
  star: '#FFA41C',
} as const;
```

---

## Monorepo 结构

```
frontend/                              # 现有 Monorepo
├── apps/
│   ├── h5/                            # H5 移动端（已完成）
│   ├── admin/                         # 后台管理（已完成）
│   └── mobile/                        # ← React Native App（新增）
│       ├── app/                       # Expo Router 文件系统路由
│       │   ├── _layout.tsx            # 根布局
│       │   ├── (tabs)/               # Tab 页面组
│       │   │   ├── _layout.tsx        # TabBar 布局
│       │   │   ├── index.tsx          # Home /
│       │   │   ├── me.tsx             # Profile /me
│       │   │   ├── cart.tsx           # Cart /cart
│       │   │   └── menu.tsx           # Menu /menu
│       │   ├── (auth)/               # 认证页面组（Guest Only）
│       │   │   ├── _layout.tsx
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   ├── search.tsx             # 搜索页
│       │   ├── product/
│       │   │   ├── index.tsx          # 商品列表
│       │   │   └── [id].tsx           # 商品详情
│       │   ├── order/
│       │   │   ├── create.tsx         # 订单确认
│       │   │   ├── index.tsx          # 订单列表
│       │   │   ├── [id].tsx           # 订单详情
│       │   │   └── [id]/
│       │   │       └── pay.tsx        # 支付页
│       │   └── me/
│       │       └── address.tsx        # 地址管理
│       │
│       ├── components/                # App 专属 RN 组件
│       │   ├── product-card.tsx
│       │   ├── product-grid.tsx
│       │   ├── sort-bar.tsx
│       │   ├── page-header.tsx
│       │   ├── price-text.tsx
│       │   ├── quantity-stepper.tsx
│       │   ├── rating-stars.tsx
│       │   ├── skeleton-loader.tsx
│       │   ├── empty-state.tsx
│       │   └── loading-button.tsx
│       │
│       ├── components/home/           # 首页专属子组件
│       │   ├── banner-carousel.tsx
│       │   ├── category-pills.tsx
│       │   ├── deal-section.tsx
│       │   ├── category-showcase.tsx
│       │   ├── new-arrivals-section.tsx
│       │   └── top-rated-section.tsx
│       │
│       ├── components/product/        # 商品专属子组件
│       │   ├── image-carousel.tsx
│       │   └── sku-selector.tsx
│       │
│       ├── stores/                    # App 专属 store（补充 @fe/hooks 不覆盖的）
│       │   ├── home.ts               # 首页数据（可直接复用 H5 store）
│       │   ├── category.ts           # 分类数据（可直接复用）
│       │   ├── cart.ts               # 购物车（可直接复用）
│       │   └── profile.ts            # 个人中心（可直接复用）
│       │
│       ├── theme/
│       │   ├── colors.ts
│       │   ├── fonts.ts
│       │   └── spacing.ts
│       │
│       ├── utils/
│       │   └── storage-adapter.ts    # MMKV 适配 Zustand persist
│       │
│       ├── app.json                   # Expo 配置
│       ├── babel.config.js
│       ├── metro.config.js           # Monorepo workspace 配置
│       ├── tailwind.config.ts        # NativeWind 配置
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                        # ← RN 直接 import，零改动
│   ├── api-client/                    # ← RN 直接 import，零改动
│   ├── hooks/                         # ← RN 直接 import，零改动
│   └── ui/                            # H5 专属，RN 不引用
└── docs/
```

---

## Expo Router 文件系统路由 vs H5 React Router

| H5 (React Router) | RN (Expo Router) | 说明 |
|-------------------|------------------|------|
| `router.tsx` 集中定义 | `app/` 目录自动生成 | 文件 = 路由 |
| `<Route path="/" element={<Home/>}>` | `app/(tabs)/index.tsx` | 约定式 |
| `<Route path="/product/:id">` | `app/product/[id].tsx` | 动态路由 |
| `useNavigate()` | `router.push()` | 导航 |
| `useParams()` | `useLocalSearchParams()` | 参数 |
| `<Outlet>` | `<Slot>` | 嵌套布局 |
| `<RequireAuth>` | `_layout.tsx` 中 redirect | 路由守卫 |

**对照示例：**

```
H5 路由结构：                    Expo Router 文件结构：

/            → Home             app/(tabs)/index.tsx
/me          → Profile          app/(tabs)/me.tsx
/cart        → Cart             app/(tabs)/cart.tsx
/menu        → Menu             app/(tabs)/menu.tsx
/search      → Search           app/search.tsx
/product     → ProductList      app/product/index.tsx
/product/:id → ProductDetail    app/product/[id].tsx
/order/create→ OrderCreate      app/order/create.tsx
/order       → OrderList        app/order/index.tsx
/order/:id   → OrderDetail      app/order/[id].tsx
/order/:id/pay → Payment        app/order/[id]/pay.tsx
/me/address  → Address          app/me/address.tsx
/login       → Login            app/(auth)/login.tsx
/register    → Register         app/(auth)/register.tsx
```

---

## 核心架构模式

### 直接复用 Zustand Store

```typescript
// stores/cart.ts — 几乎可以从 H5 直接 copy

import { create } from 'zustand';
import { cart } from '@fe/api-client';  // ← 直接复用

interface CartState {
  items: CartItem[];
  loading: boolean;
  loaded: boolean;
  fetch: () => Promise<void>;
  reload: () => Promise<void>;
  mutate: (fn: (items: CartItem[]) => CartItem[]) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,

  fetch: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const items = await cart.list();     // ← @fe/api-client
      set({ items, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  reload: async () => {
    set({ loaded: false });
    await get().fetch();
  },

  mutate: (fn) => set((s) => ({ items: fn(s.items) })),
  clear: () => set({ items: [], loaded: false }),
}));
```

### API 调用层 — 零改动复用

```typescript
// 在 RN 中直接使用 @fe/api-client，与 H5 完全一致
import { product, cart, order, auth } from '@fe/api-client';
import { ERROR_CODE } from '@fe/shared';
import { useAuthStore } from '@fe/hooks';

// 搜索商品 — 与 H5 写法一模一样
const result = await product.search({
  keyword: '手机',
  sort: 'sales',
  page: 1,
  pageSize: 20,
});

// 加入购物车 — 与 H5 写法一模一样
try {
  await cart.add({ skuId, quantity: 1 });
} catch (err) {
  if (err instanceof ApiError && err.is(ERROR_CODE.STOCK_INSUFFICIENT)) {
    Alert.alert('库存不足');
  }
}
```

### 本地存储适配

```typescript
// utils/storage-adapter.ts
// H5 用 localStorage，RN 用 MMKV（高性能同步存储）

import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// 适配 @fe/shared 的 storage 接口
export const storageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

// Token 使用 expo-secure-store（加密）
import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync('accessToken'),
  setAccessToken: (token: string) => SecureStore.setItemAsync('accessToken', token),
  clear: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },
};
```

---

## UI 组件 — H5 → RN 对照

### ProductCard 对比

```tsx
// ════════ H5 版本 (apps/h5) ════════
<div className="product-card" onClick={() => navigate(`/dp/${id}`)}>
  <img src={image} className="w-full aspect-square rounded-8 object-cover" />
  <div className="mt-8 text-26 line-clamp-2">{title}</div>
  <div className="mt-4 text-28 font-700 text-[#b12704]">¥{price}</div>
</div>

// ════════ RN 版本 (apps/mobile) ════════
<Pressable onPress={() => router.push(`/product/${id}`)} className="bg-white rounded-lg">
  <Image source={{ uri: image }} className="w-full aspect-square rounded-t-lg" />
  <View className="p-2">
    <Text numberOfLines={2} className="text-sm text-[#0f1111]">{title}</Text>
    <Text className="text-base font-bold text-[#b12704]">¥{price}</Text>
  </View>
</Pressable>
```

### 关键组件差异

| 概念 | H5 (Web) | RN (Native) |
|------|---------|-------------|
| 容器 | `<div>` | `<View>` |
| 文字 | `<span>` / `<p>` | `<Text>`（**文字必须包在 Text 里**）|
| 点击 | `<div onClick>` | `<Pressable onPress>` |
| 图片 | `<img src>` | `<Image source={{ uri }}>` |
| 输入 | `<input>` | `<TextInput>` |
| 滚动 | `overflow: scroll` | `<ScrollView>` / `<FlashList>` |
| 列表 | `array.map()` | `<FlashList data renderItem>` |
| 链接 | `<Link to>` | `<Link href>` (Expo Router) |
| 模态 | CSS position | `<Modal>` / `<BottomSheet>` |

---

## 分阶段实现计划

共 10 个 Phase，与 Android / iOS 计划完全对齐。

---

### Phase 1 — 项目初始化 + 核心基础设施 `[ ]`

> 搭建 Expo 项目，配置 Monorepo workspace，验证 @fe/* 包复用。

**目标：** App 能启动，能调 API，Token 能存取，@fe/* 包正常引用。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `app.json` | Expo 配置（app name、bundle id、splash） |
| `package.json` | 依赖声明 + workspace 引用 |
| `metro.config.js` | Monorepo workspace 解析配置 |
| `babel.config.js` | NativeWind + module-resolver |
| `tailwind.config.ts` | NativeWind 主题配置（Amazon 色系） |
| `tsconfig.json` | 路径别名 + workspace 引用 |
| `app/_layout.tsx` | 根布局，全局 Provider |
| `theme/colors.ts` | Amazon 色系常量 |
| `theme/fonts.ts` | 字体系统 |
| `theme/spacing.ts` | 间距规范 |
| `utils/storage-adapter.ts` | MMKV 适配 @fe/shared storage |
| `utils/secure-storage.ts` | expo-secure-store Token 存储 |

**关键配置 — Monorepo 支持：**

```javascript
// metro.config.js — 让 Metro 能解析 packages/* 下的代码
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
```

**验证 @fe/* 包复用：**

```typescript
// 测试：在 RN 中直接 import 现有包
import { ERROR_CODE } from '@fe/shared';        // ✅ 类型 + 常量
import { product, ApiError } from '@fe/api-client'; // ✅ API 调用
import { useAuthStore } from '@fe/hooks';         // ✅ Zustand store

// 验证 API 能通
const result = await product.list({ page: 1, pageSize: 5 });
console.log(result.items); // ✅
```

**验收标准：**
- [ ] `npx expo start` 启动，iOS 模拟器 / Android 模拟器都能运行
- [ ] `@fe/shared` 类型和常量可正常 import
- [ ] `@fe/api-client` 能请求 `/api/v1/product/list` 并解析
- [ ] `@fe/hooks` 的 `useAuthStore` 正常工作
- [ ] Token 通过 expo-secure-store 存取正常
- [ ] NativeWind 样式生效（验证一个带颜色的 View）

---

### Phase 2 — 导航框架 + 认证流程 `[ ]`

> Expo Router Tab 导航 + 登录/注册闭环。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `app/_layout.tsx` | 根布局（AuthProvider + 全局配置） |
| `app/(tabs)/_layout.tsx` | TabBar 布局（4 Tab） |
| `app/(tabs)/index.tsx` | Home 占位 |
| `app/(tabs)/me.tsx` | Profile 占位 |
| `app/(tabs)/cart.tsx` | Cart 占位 |
| `app/(tabs)/menu.tsx` | Menu 占位 |
| `app/(auth)/_layout.tsx` | 认证页面布局 |
| `app/(auth)/login.tsx` | 登录页 |
| `app/(auth)/register.tsx` | 注册页 |

**Tab 布局：**

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useCartStore } from '@/stores/cart';

export default function TabLayout() {
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007185',
      tabBarInactiveTintColor: '#565959',
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <HomeIcon color={color} />,
      }} />
      <Tabs.Screen name="me" options={{
        title: 'You',
        tabBarIcon: ({ color }) => <UserIcon color={color} />,
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Cart',
        tabBarIcon: ({ color }) => <CartIcon color={color} />,
        tabBarBadge: cartCount > 0 ? cartCount : undefined,
      }} />
      <Tabs.Screen name="menu" options={{
        title: 'Menu',
        tabBarIcon: ({ color }) => <MenuIcon color={color} />,
      }} />
    </Tabs>
  );
}
```

**路由守卫：**

```tsx
// app/_layout.tsx — 全局认证检查
import { useAuthStore } from '@fe/hooks';
import { useSegments, useRouter } from 'expo-router';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inProtected = segments.includes('cart') || segments.includes('order');

    if (!isLoggedIn && inProtected) {
      router.replace('/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/');
    }
  }, [isLoggedIn, segments]);

  return <>{children}</>;
}
```

**验收标准：**
- [ ] 4 Tab 切换，图标 + 文字 + 高亮
- [ ] Cart Tab Badge 显示数量
- [ ] 登录表单验证 + API（复用 @fe/api-client）
- [ ] 注册表单验证 + API
- [ ] 登录成功 → 存 Token → 跳首页
- [ ] 已登录访问登录页 → 重定向
- [ ] 未登录访问购物车 → 跳登录

---

### Phase 3 — 首页 Home `[ ]`

> 多区块首页，Amazon 风格。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `app/(tabs)/index.tsx` | 首页（引用各区块组件） |
| `stores/home.ts` | 首页数据 store（复用 H5 逻辑） |
| `stores/category.ts` | 分类 store（复用 H5 逻辑） |
| `components/home/banner-carousel.tsx` | 轮播：reanimated + gesture-handler |
| `components/home/category-pills.tsx` | 横滑胶囊：ScrollView horizontal |
| `components/home/deal-section.tsx` | Deal 横滑 |
| `components/home/category-showcase.tsx` | 分类展示 |
| `components/home/new-arrivals-section.tsx` | 新品 |
| `components/home/top-rated-section.tsx` | 好评 |
| `components/product-card.tsx` | 商品卡片 |
| `components/product-grid.tsx` | 2 列网格 + FlashList |
| `components/price-text.tsx` | 价格组件 |
| `components/rating-stars.tsx` | 星级评分 |
| `components/skeleton-loader.tsx` | 骨架屏 |

**页面结构（ScrollView / FlashList）：**

```
┌─────────────────────────────────┐
│ [深色搜索栏] Pressable           │
│ 📍 Deliver to Alice — Shanghai  │
├─────────────────────────────────┤
│ [分类胶囊] ScrollView horizontal │
├─────────────────────────────────┤
│ [Banner] react-native-reanimated│
│   + gesture-handler 自动轮播     │
│   3 秒 + 手势滑动                │
├─────────────────────────────────┤
│ Deal of the Day                 │
│ [横滑] ScrollView horizontal     │
├─────────────────────────────────┤
│ [分类展示] 2x2 View 网格        │
├─────────────────────────────────┤
│ New Arrivals / Top Rated        │
│ [横滑] ScrollView horizontal     │
├─────────────────────────────────┤
│ Recommended for You             │
│ FlashList numColumns={2}        │
│ onEndReached 无限滚动            │
└─────────────────────────────────┘
```

**Banner 轮播（reanimated 实现）：**

```tsx
// components/home/banner-carousel.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const translateX = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const { width } = useWindowDimensions();

  // 自动轮播 — 3 秒
  useEffect(() => {
    const timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % banners.length;
      translateX.value = withTiming(-currentIndex.value * width, { duration: 300 });
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // 手势滑动
  const gesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationX < -50 && currentIndex.value < banners.length - 1) {
        currentIndex.value += 1;
      } else if (e.translationX > 50 && currentIndex.value > 0) {
        currentIndex.value -= 1;
      }
      translateX.value = withTiming(-currentIndex.value * width);
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, { flexDirection: 'row' }]}>
        {banners.map((banner) => (
          <Image key={banner.id} source={{ uri: banner.imageUrl }}
            style={{ width, height: width * 0.5 }} />
        ))}
      </Animated.View>
    </GestureDetector>
  );
}
```

**验收标准：**
- [ ] 搜索栏点击跳转搜索页
- [ ] 分类胶囊横滑，点击跳商品列表
- [ ] Banner 自动轮播 + 手势滑动
- [ ] Deal 横滑
- [ ] 推荐区 2 列 FlashList 无限滚动
- [ ] 骨架屏 loading
- [ ] 下拉刷新 `RefreshControl`
- [ ] store 逻辑与 H5 一致

---

### Phase 4 — 搜索页 Search `[ ]`

> 全屏搜索，复用 H5 搜索逻辑。

**文件清单：**

| 文件 | 说明 |
|------|------|
| `app/search.tsx` | 搜索页 |
| `components/sort-bar.tsx` | 排序栏（复用） |

**与 H5 的代码复用：**

```typescript
// 搜索逻辑几乎可以直接从 H5 copy
// H5: apps/h5/src/pages/product/search.tsx 中的 state + 逻辑
// RN: 只需把 JSX 从 <div> 换成 <View>/<Text>

// 搜索历史 — 复用 @fe/shared storage
import { getStorageItem, setStorageItem } from '@fe/shared';
// 只需在 Phase 1 配好 storage adapter，这里零改动

// 搜索 API — 直接复用
import { product } from '@fe/api-client';
const result = await product.search({ keyword, sort, page, pageSize });
```

**验收标准：**
- [ ] TextInput autoFocus
- [ ] 搜索历史持久化（MMKV）
- [ ] 点击历史/热词搜索
- [ ] 清除历史
- [ ] 排序切换
- [ ] FlashList 无限滚动

---

### Phase 5 — 分类页 Menu `[ ]`

> 左右分栏。

**文件：** `app/(tabs)/menu.tsx`

**布局：**

```tsx
<View className="flex-row flex-1">
  {/* 左栏：一级分类 */}
  <ScrollView className="w-[88px] bg-[#f5f5f5]">
    {categories.map((cat) => (
      <Pressable key={cat.id}
        onPress={() => setSelectedId(cat.id)}
        className={cn(
          'py-4 px-3',
          selectedId === cat.id && 'bg-white border-l-3 border-[#007185]'
        )}>
        <Text>{cat.name}</Text>
      </Pressable>
    ))}
  </ScrollView>

  {/* 右栏：二级分类 */}
  <ScrollView className="flex-1 p-3">
    <View className="flex-row flex-wrap">
      {subcategories.map((sub) => (
        <Pressable key={sub.id} className="w-1/3 items-center py-3"
          onPress={() => router.push(`/product?categoryId=${sub.id}`)}>
          <Image source={{ uri: sub.iconUrl }} className="w-12 h-12" />
          <Text className="mt-1 text-xs">{sub.name}</Text>
        </Pressable>
      ))}
    </View>
  </ScrollView>
</View>
```

**验收标准：**
- [ ] 左侧一级分类切换
- [ ] 右侧二级分类显示
- [ ] 点击跳转商品列表
- [ ] 选中态样式正确

---

### Phase 6 — 商品列表 & 详情 `[ ]`

> 浏览 → 决策核心链路。

#### 6a. 商品列表

| 文件 | 说明 |
|------|------|
| `app/product/index.tsx` | 列表页 |
| `components/product-grid.tsx` | FlashList 2 列 + onEndReached |

#### 6b. 商品详情

| 文件 | 说明 |
|------|------|
| `app/product/[id].tsx` | 详情页 |
| `components/product/image-carousel.tsx` | reanimated 图片轮播 |
| `components/product/sku-selector.tsx` | SKU 选择器 |

**详情页结构：**

```
┌─────────────────────────────────┐
│ ←                    🛒   ⋮     │  Stack.Screen options
├─────────────────────────────────┤
│ ┌─ 图片轮播 ─────────────────┐ │  reanimated + gesture
│ │                             │ │
│ │          1 / 3              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ¥7,999                         │  PriceText
│ ¥9,999  -20%                   │
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
│ ┌──────────────┬──────────────┐ │  SafeAreaView 固定底部
│ │  Add to Cart │  Buy Now     │ │
│ └──────────────┴──────────────┘ │
└─────────────────────────────────┘
```

**SKU 选择逻辑 — 从 H5 直接复用：**

```typescript
// H5 的 SKU 选择算法是纯 TypeScript 逻辑
// 从 apps/h5/src/pages/product/detail.tsx 提取后
// 可直接在 RN 中复用，零改动

// 提取属性维度
const dimensions = extractDimensions(skus);
// 用户选择后匹配 SKU
const matchedSku = findMatchingSku(skus, selectedAttrs);
// 检查库存
const isAvailable = (sku: Sku) => sku.stock > 0;
```

**验收标准：**
- [ ] 列表排序切换
- [ ] FlashList 无限滚动
- [ ] 图片轮播 + 手势
- [ ] SKU 选择联动价格/库存
- [ ] 库存为 0 禁用
- [ ] Add to Cart + Toast
- [ ] Buy Now → 下单
- [ ] 底部栏固定（SafeAreaView）

---

### Phase 7 — 购物车 Cart `[ ]`

> 直接复用 H5 cart store 逻辑。

**文件：** `app/(tabs)/cart.tsx`

**核心代码 — 与 H5 的防抖逻辑完全一致：**

```typescript
// stores/cart.ts — 从 H5 直接复制，仅改 storage adapter
// 防抖逻辑也完全一致

const useCartStore = create<CartState>((set, get) => ({
  // ... 与 H5 apps/h5/src/stores/cart.ts 一致
}));

// 组件中的 debounce — 与 H5 一致
const timerRef = useRef<ReturnType<typeof setTimeout>>();

const handleQuantityChange = (skuId: string, qty: number) => {
  // 乐观更新
  useCartStore.getState().mutate((items) =>
    items.map((item) => item.skuId === skuId ? { ...item, quantity: qty } : item)
  );
  // 300ms 防抖
  clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    cart.update({ skuId, quantity: qty });
  }, 300);
};
```

**滑动删除：**

```tsx
import { Swipeable } from 'react-native-gesture-handler';

<Swipeable renderRightActions={() => (
  <Pressable onPress={() => handleRemove(item.skuId)}
    className="bg-red-500 w-20 justify-center items-center">
    <Text className="text-white font-bold">Delete</Text>
  </Pressable>
)}>
  <CartItemRow item={item} />
</Swipeable>
```

**验收标准：**
- [ ] 未登录 → 空状态 + "Sign in"
- [ ] 列表正确渲染
- [ ] 勾选联动小计
- [ ] 数量乐观更新 + 300ms 防抖
- [ ] 滑动删除
- [ ] 全选/取消
- [ ] 结算跳转

---

### Phase 8 — 个人中心 Profile `[ ]`

> 复用 H5 profile store。

**文件：** `app/(tabs)/me.tsx`, `stores/profile.ts`

**验收标准：**
- [ ] 未登录 → "Sign in"
- [ ] 已登录 → 用户名 + 2x2 功能入口
- [ ] 最近 3 条订单
- [ ] Sign Out → 清 Token → 回首页

---

### Phase 9 — 订单全流程 `[ ]`

> 下单 → 支付 → 查看。

#### 9a. 订单确认页

**文件：** `app/order/create.tsx`

- 地址选择（`@gorhom/bottom-sheet` 弹出）
- 商品清单 + 金额
- "Place Order" + 幂等 key

#### 9b. 支付页

**文件：** `app/order/[id]/pay.tsx`

- 金额 + 支付方式
- 倒计时（`useEffect` + `setInterval`）
- "Pay Now" + 幂等 key

#### 9c. 订单列表

**文件：** `app/order/index.tsx`

- Tab 切换（自定义 ScrollView horizontal tab）
- FlashList 无限滚动

#### 9d. 订单详情

**文件：** `app/order/[id].tsx`

- 状态 Banner + 地址 + 商品 + 金额
- 操作按钮

**验收标准：**
- [ ] 确认页展示正确
- [ ] 地址选择 BottomSheet
- [ ] 幂等 key 防重复
- [ ] 支付倒计时
- [ ] 列表 Tab 筛选 + 分页
- [ ] 详情按状态操作

---

### Phase 10 — 地址管理 + 收尾优化 `[ ]`

> 最后一个功能 + 全局打磨。

#### 10a. 地址管理

**文件：** `app/me/address.tsx`

- 地址列表 + 滑动删除
- 新增/编辑（BottomSheet 表单）
- 设为默认

#### 10b. 全局优化

| 优化项 | RN 实现 |
|--------|---------|
| 下拉刷新 | `RefreshControl` |
| 网络异常 | `@react-native-community/netinfo` |
| 深色模式 | `useColorScheme()` + NativeWind dark: |
| 启动屏 | `expo-splash-screen` |
| 转场动画 | Expo Router `animation` prop |
| App 图标 | `expo-asset` 配置 |
| OTA 更新 | EAS Update 配置 |
| 性能优化 | FlashList 调优 + 图片缓存策略 |

**验收标准：**
- [ ] 地址 CRUD 完整
- [ ] 下拉刷新全局
- [ ] 深色模式
- [ ] 启动屏
- [ ] 转场动画流畅
- [ ] iOS + Android 双平台验证通过

---

## Phase 依赖关系

```
Phase 1 (基础设施 + @fe/* 包复用验证)
  └─→ Phase 2 (Expo Router + 认证)
        ├─→ Phase 3 (首页)
        │     ├─→ Phase 4 (搜索)
        │     └─→ Phase 5 (分类)
        ├─→ Phase 6 (商品列表 & 详情)
        │     └─→ Phase 7 (购物车)
        │           └─→ Phase 9 (订单全流程)
        │                 └─→ Phase 10 (地址 + 收尾)
        └─→ Phase 8 (个人中心)
```

---

## 三端文件对照表

| H5 | Android | iOS | RN (本计划) |
|----|---------|-----|-------------|
| `router.tsx` | `AppNavGraph.kt` | `MainTabView.swift` | `app/_layout.tsx` + 文件系统 |
| `root-layout.tsx` | `MainScreen.kt` | `MainTabView.swift` | `app/(tabs)/_layout.tsx` |
| `stores/home.ts` | `HomeViewModel.kt` | `HomeFeature.swift` | `stores/home.ts` (**复用**) |
| `stores/cart.ts` | `CartViewModel.kt` | `CartFeature.swift` | `stores/cart.ts` (**复用**) |
| `stores/category.ts` | `MenuViewModel.kt` | `MenuFeature.swift` | `stores/category.ts` (**复用**) |
| `stores/profile.ts` | `ProfileViewModel.kt` | `ProfileFeature.swift` | `stores/profile.ts` (**复用**) |
| `components/product-card.tsx` | `ProductCard.kt` | `ProductCard.swift` | `components/product-card.tsx` |
| `components/product-grid.tsx` | `ProductGrid.kt` | `ProductGrid.swift` | `components/product-grid.tsx` |
| `pages/home/index.tsx` | `HomeScreen.kt` | `HomeView.swift` | `app/(tabs)/index.tsx` |
| `pages/product/detail.tsx` | `ProductDetailScreen.kt` | `ProductDetailView.swift` | `app/product/[id].tsx` |
| `pages/product/list.tsx` | `ProductListScreen.kt` | `ProductListView.swift` | `app/product/index.tsx` |
| `pages/product/search.tsx` | `SearchScreen.kt` | `SearchView.swift` | `app/search.tsx` |
| `pages/menu/index.tsx` | `MenuScreen.kt` | `MenuView.swift` | `app/(tabs)/menu.tsx` |
| `pages/cart/index.tsx` | `CartScreen.kt` | `CartView.swift` | `app/(tabs)/cart.tsx` |
| `pages/order/create.tsx` | `OrderCreateScreen.kt` | `OrderCreateView.swift` | `app/order/create.tsx` |
| `pages/order/list.tsx` | `OrderListScreen.kt` | `OrderListView.swift` | `app/order/index.tsx` |
| `pages/order/detail.tsx` | `OrderDetailScreen.kt` | `OrderDetailView.swift` | `app/order/[id].tsx` |
| `pages/order/payment.tsx` | `PaymentScreen.kt` | `PaymentView.swift` | `app/order/[id]/pay.tsx` |
| `pages/user/profile.tsx` | `ProfileScreen.kt` | `ProfileView.swift` | `app/(tabs)/me.tsx` |
| `pages/user/address.tsx` | `AddressScreen.kt` | `AddressView.swift` | `app/me/address.tsx` |
| `pages/auth/login.tsx` | `LoginScreen.kt` | `LoginView.swift` | `app/(auth)/login.tsx` |
| `pages/auth/register.tsx` | `RegisterScreen.kt` | `RegisterView.swift` | `app/(auth)/register.tsx` |
| `styles/globals.scss` | `ShopTheme.kt` | `ShopColors.swift` | `theme/colors.ts` |

---

## RN vs 原生双端 — 成本对比

| 维度 | 原生 iOS + Android | React Native |
|------|-------------------|-------------|
| 语言 | Swift + Kotlin（学 2 门） | **TypeScript（已经会）** |
| UI 框架 | SwiftUI + Compose（学 2 套） | **React（已经会）** |
| 状态管理 | TCA + MVI（学 2 套） | **Zustand（已经会，直接复用）** |
| API 层 | 写 2 遍 | **复用 @fe/api-client** |
| 类型定义 | 写 2 遍（Swift struct + Kotlin data class） | **复用 @fe/shared** |
| 业务逻辑 | 写 2 遍 | **复用 H5 store + hooks** |
| 代码总量 | ~8,000 行 × 2 = ~16,000 行 | **~5,000 行**（60-70% 复用） |
| 开发人数 | 至少 2 人 | **1 人** |
| 学习成本 | 高（2 门语言 + 2 套框架） | **极低（已有全部技能）** |
| 产出平台 | iOS + Android | **iOS + Android** |

---

## 当前实现状态

| Phase | 描述 | 状态 |
|-------|------|------|
| Phase 1 | 项目初始化 + @fe/* 复用验证 | ⬜ 待实现 |
| Phase 2 | Expo Router + 认证 | ⬜ 待实现 |
| Phase 3 | 首页 Home | ⬜ 待实现 |
| Phase 4 | 搜索页 Search | ⬜ 待实现 |
| Phase 5 | 分类页 Menu | ⬜ 待实现 |
| Phase 6 | 商品列表 & 详情 | ⬜ 待实现 |
| Phase 7 | 购物车 Cart | ⬜ 待实现 |
| Phase 8 | 个人中心 Profile | ⬜ 待实现 |
| Phase 9 | 订单全流程 | ⬜ 待实现 |
| Phase 10 | 地址管理 + 收尾优化 | ⬜ 待实现 |
