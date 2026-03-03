import { useEffect, Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ToastProvider } from '@fe/ui';
import { useAuthStore } from '@fe/hooks';
import { router } from './router';

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
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntdApp>
        <ToastProvider>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={router} />
          </Suspense>
        </ToastProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
