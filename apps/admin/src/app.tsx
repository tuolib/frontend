import { useEffect, Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ToastProvider, ErrorBoundary } from '@fe/ui';
import { useVersionCheck } from '@fe/hooks';
import { setApiErrorNotifier } from '@fe/api-client';
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

/** 在 AntdApp 上下文内注册全局错误提示 */
function ApiErrorSetup() {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setApiErrorNotifier((msg) => message.error(msg));
  }, [message]);

  return null;
}

export function App() {
  const initialize = useAdminAuthStore((s) => s.initialize);

  useVersionCheck();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntdApp>
        <ApiErrorSetup />
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
