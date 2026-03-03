/**
 * usePagination — 分页状态管理
 */

import { useState, useCallback } from 'react';
import type { PaginationMeta } from '@fe/shared';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  pagination: PaginationMeta | null;
  setPagination: (meta: PaginationMeta) => void;
  reset: () => void;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, initialPageSize = 20 } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPagination(null);
  }, [initialPage]);

  return { page, pageSize, setPage, setPageSize, pagination, setPagination, reset };
}
