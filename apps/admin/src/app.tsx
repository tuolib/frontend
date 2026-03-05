import { useEffect, Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ToastProvider, ErrorBoundary } from '@fe/ui';
import { router } from './router';
import { useAdminAuthStore } from './stores/admin-auth';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
  },
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spin size="large" />
    </div>
  );
}

export function App() {
  const initialize = useAdminAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntdApp>
        <ToastProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </ToastProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
