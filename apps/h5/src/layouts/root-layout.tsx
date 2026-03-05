/**
 * RootLayout — 底部 TabBar 布局
 */

import { Outlet, useLocation, useNavigate } from 'react-router';

const tabs = [
  { path: '/', label: '首页', icon: 'i-carbon-home' },
  { path: '/product', label: '分类', icon: 'i-carbon-grid' },
  { path: '/cart', label: '购物车', icon: 'i-carbon-shopping-cart' },
  { path: '/me', label: '我的', icon: 'i-carbon-user-avatar' },
];

export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-14">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around h-50 z-40"
        style={{ paddingBottom: 'var(--safe-area-bottom)' }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full ${
                isActive ? 'text-[#e4393c]' : 'text-gray-500'
              }`}
            >
              <span className={`${tab.icon} text-22`} />
              <span className="text-10">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
