import { useEffect, Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { ToastProvider, ErrorBoundary, Spinner } from '@fe/ui';
import { useAuthStore } from '@fe/hooks';
import { router } from './router';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

export function App() {
  const initialize = useAuthStore((s) => s.initialize);

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
