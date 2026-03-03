/**
 * 分页相关类型 — 镜像后端 PaginationInput / PaginationMeta
 */

export interface PaginationInput {
  page: number;
  pageSize: number;
  sort?: string;
  order?: SortOrder;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type SortOrder = 'asc' | 'desc';
export type ID = string;
export type Nullable<T> = T | null;
