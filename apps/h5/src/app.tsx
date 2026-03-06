import { useEffect, Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { ToastProvider, ErrorBoundary, Spinner, showToast } from '@fe/ui';
import { useAuthStore, useVersionCheck } from '@fe/hooks';
import { setApiErrorNotifier } from '@fe/api-client';
import { router } from './router';

setApiErrorNotifier((msg) => showToast(msg, 'error'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

export function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useVersionCheck();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ToastProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}
