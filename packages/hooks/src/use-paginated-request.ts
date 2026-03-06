/**
 * usePaginatedRequest — 分页列表请求 hook，支持加载更多 + AbortController
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PaginationMeta } from '@fe/shared';

interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

interface UsePaginatedRequestOptions {
  /** 每页条数，默认 10 */
  pageSize?: number;
  /** 组件挂载时自动加载第一页，默认 true */
  immediate?: boolean;
  /** 依赖数组，变化时重置并重新加载 */
  deps?: unknown[];
}

interface UsePaginatedRequestReturn<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  pagination: PaginationMeta | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  mutateItems: (updater: T[] | ((prev: T[]) => T[])) => void;
}

export function usePaginatedRequest<T>(
  fetcher: (page: number, pageSize: number, signal: AbortSignal) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedRequestOptions = {},
): UsePaginatedRequestReturn<T> {
  const { pageSize = 10, immediate = true, deps = [] } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(immediate);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const pageRef = useRef(1);
  const seqRef = useRef(0);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const seq = ++seqRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetcher(page, pageSize, undefined as unknown as AbortSignal);

        if (seq !== seqRef.current) return;

        if (append) {
          setItems((prev) => [...prev, ...result.items]);
        } else {
          setItems(result.items);
        }
        setPagination(result.pagination);
        pageRef.current = page;
      } catch (err) {
        if (seq !== seqRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (seq === seqRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageSize, ...deps],
  );

  useEffect(() => {
    if (immediate) {
      pageRef.current = 1;
      setItems([]);
      setPagination(null);
      fetchPage(1, false);
    }
  }, [fetchPage, immediate]);

  const loadMore = useCallback(async () => {
    const next = pageRef.current + 1;
    await fetchPage(next, true);
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    setItems([]);
    await fetchPage(1, false);
  }, [fetchPage]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const mutateItems = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      setItems((prev) => (typeof updater === 'function' ? (updater as (p: T[]) => T[])(prev) : updater));
    },
    [],
  );

  return { items, loading, loadingMore, error, hasMore, pagination, loadMore, refresh, mutateItems };
}
