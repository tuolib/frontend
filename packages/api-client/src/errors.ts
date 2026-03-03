/**
 * 前端 API 错误类 — 封装后端错误响应
 */

import type { ApiErrorResponse } from './types';

export class ApiError extends Error {
  public readonly code: number;
  public readonly errorCode: string;
  public readonly details?: unknown;
  public readonly traceId: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.code = response.code;
    this.errorCode = response.meta.code;
    this.details = response.meta.details;
    this.traceId = response.traceId;
  }

  is(code: string): boolean {
    return this.errorCode === code;
  }

  get isUnauthorized(): boolean {
    return this.code === 401;
  }

  get isNotFound(): boolean {
    return this.code === 404;
  }

  get isValidationError(): boolean {
    return this.code === 422;
  }
}
