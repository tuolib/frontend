/**
 * API 响应类型 — 镜像后端响应信封格式
 */

export interface ApiSuccessResponse<T> {
  code: 200;
  success: true;
  data: T;
  message: string;
  traceId: string;
}

export interface ApiErrorResponse {
  code: number;
  success: false;
  message: string;
  data: null;
  meta: {
    code: string;
    message: string;
    details?: unknown;
  };
  traceId: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
