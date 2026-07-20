import { AxiosError, AxiosRequestConfig } from 'axios';

import type { ApiErrorResponse } from '../types';

export type ApiRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
};

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

export type ApiErrorDetail =
  | string
  | { msg: string; type: string }
  | { msg: string; type: string }[];

export class ApiError extends Error {
  readonly status: number;
  readonly details: ApiErrorDetail | undefined;
  readonly isNetworkError: boolean;
  readonly originalError: AxiosError<ApiErrorResponse | unknown> | undefined;

  constructor(options: {
    message: string;
    status: number;
    details?: ApiErrorDetail;
    isNetworkError?: boolean;
    originalError?: AxiosError<ApiErrorResponse | unknown>;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.details = options.details;
    this.isNetworkError = options.isNetworkError ?? false;
    this.originalError = options.originalError;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function parseApiError(error: AxiosError<ApiErrorResponse | unknown>): ApiError {
  if (!error.response) {
    return new ApiError({
      message: error.message || 'Network request failed',
      status: 0,
      isNetworkError: true,
      originalError: error,
    });
  }

  const { status, data } = error.response;
  const details = (data as ApiErrorResponse | undefined)?.detail;
  const message = formatErrorMessage(details, status);

  return new ApiError({
    message,
    status,
    details,
    originalError: error,
  });
}

function formatErrorMessage(detail: ApiErrorDetail | undefined, status: number): string {
  if (!detail) {
    return `Request failed with status ${status}`;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(', ');
  }

  return detail.msg;
}
