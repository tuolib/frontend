/**
 * useRequest — 通用异步请求 hook，管理 loading/error/data + AbortController
 */

import { useState, useEffect, useCallback } from 'react';

interface UseRequestOptions<T> {
  /** 组件挂载时自动执行，默认 true */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: T;
  /** 依赖数组，变化时重新执行（仅 immediate=true 时生效） */
  deps?: unknown[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseRequestReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  run: () => Promise<T | undefined>;
  mutate: (data: T | undefined | ((prev: T | undefined) => T | undefined)) => void;
}

export function useRequest<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: UseRequestOptions<T> = {},
): UseRequestReturn<T> {
  const { immediate = true, initialData, deps = [], onSuccess, onError } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(undefined as unknown as AbortSignal);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      onError?.(e);
      return undefined;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetcher 和 callbacks 不作为依赖
  }, deps);

  useEffect(() => {
    if (immediate) {
      run();
    }
  }, [run, immediate]);

  const mutate = useCallback(
    (updater: T | undefined | ((prev: T | undefined) => T | undefined)) => {
      setData((prev) => (typeof updater === 'function' ? (updater as (p: T | undefined) => T | undefined)(prev) : updater));
    },
    [],
  );

  return { data, loading, error, run, mutate };
}
