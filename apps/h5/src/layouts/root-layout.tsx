/**
 * RootLayout — Amazon 风格底部 4-Tab 导航 + 首页顶部搜索栏
 */

import { Outlet, useLocation, useNavigate } from 'react-router';

const tabs = [
  { path: '/', label: 'Home', icon: 'i-carbon-home' },
  { path: '/me', label: 'You', icon: 'i-carbon-user-avatar' },
  { path: '/cart', label: 'Cart', icon: 'i-carbon-shopping-cart' },
  { path: '/menu', label: 'Menu', icon: 'i-carbon-menu' },
];

export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[#eaeded]">
      {/* 顶部搜索栏（仅首页显示） */}
      {isHome && (
        <header className="amz-header sticky top-0 z-50">
          <div className="flex items-center gap-8 px-12 pt-[calc(var(--safe-area-top)+8px)] pb-8">
            <div
              className="flex-1 h-36 bg-white rounded-8 flex items-center px-12 gap-8 cursor-pointer"
              onClick={() => navigate('/search')}
            >
              <span className="i-carbon-search text-20 text-[#565959]" />
              <span className="text-14 text-[#565959]">Search</span>
            </div>
          </div>
          <div className="flex items-center gap-4 px-12 pb-8">
            <span className="i-carbon-location text-14 text-white" />
            <span className="text-12 text-[#ccc]">
              Deliver to — <span className="text-white font-600">Shanghai</span>
            </span>
          </div>
        </header>
      )}

      <main className="flex-1 pb-50">
        <Outlet />
      </main>

      {/* 底部导航 */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white flex items-center justify-around h-50 z-40 border-t border-t-[#ddd]"
        style={{ paddingBottom: 'var(--safe-area-bottom)' }}
      >
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-2 flex-1 h-full ${
                isActive ? 'text-[#007185]' : 'text-[#565959]'
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
