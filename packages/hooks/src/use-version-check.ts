import { useEffect } from 'react';

declare const __APP_VERSION__: string;

const CHUNK_RELOAD_KEY = '__chunk_reload__';

async function checkVersion() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`);
    if (!res.ok) return;
    const { version } = await res.json();
    if (version && version !== __APP_VERSION__) {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      window.location.reload();
    }
  } catch {
    // network error, ignore
  }
}

/**
 * Chunk 加载失败时自动刷新一次（防止无限循环）。
 * 由 ErrorBoundary 或 unhandledrejection 触发。
 */
export function handleChunkError(error: Error): boolean {
  const msg = error.message;
  const isChunk =
    error.name === 'ChunkLoadError' ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Loading CSS chunk');

  if (!isChunk) return false;

  if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    window.location.reload();
    return true;
  }

  return false;
}

/**
 * 检测新版本发布，自动刷新页面。
 * - 页面从后台切回前台时检测
 * - 每 5 分钟定期检测
 * - 仅生产环境生效
 */
export function useVersionCheck() {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    // 清除 chunk reload 标记（说明刷新后页面正常加载了）
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    const timer = setInterval(checkVersion, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(timer);
    };
  }, []);
}
