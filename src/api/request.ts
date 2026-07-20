import { AxiosRequestConfig, AxiosResponse } from 'axios';

import type { ApiResponse } from '../types';

import { apiClient } from './client';
import type { ApiRequestConfig } from './errors';

type ResponseBody<T> = T | ApiResponse<T>;

function unwrapResponse<T>(data: ResponseBody<T>): T {
  if (data !== null && typeof data === 'object' && 'data' in data) {
    return (data as ApiResponse<T>).data;
  }

  return data as T;
}

export async function request<T>(
  config: ApiRequestConfig,
): Promise<T> {
  const response: AxiosResponse<ResponseBody<T>> = await apiClient.request(config);
  return unwrapResponse(response.data);
}

export const api = {
  get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    return request<T>({ ...config, method: 'GET', url });
  },

  post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return request<T>({ ...config, method: 'POST', url, data });
  },

  put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return request<T>({ ...config, method: 'PUT', url, data });
  },

  patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return request<T>({ ...config, method: 'PATCH', url, data });
  },

  delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    return request<T>({ ...config, method: 'DELETE', url });
  },
};

export type { ApiRequestConfig };

export type UploadProgressHandler = NonNullable<
  AxiosRequestConfig['onUploadProgress']
>;

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type MultipartFieldValue = string | UploadFile;

export function buildFormData(
  fields: Record<string, MultipartFieldValue | MultipartFieldValue[]>,
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    const values = Array.isArray(value) ? value : [value];

    for (const entry of values) {
      if (typeof entry === 'string') {
        formData.append(key, entry);
        continue;
      }

      formData.append(key, {
        uri: entry.uri,
        name: entry.name,
        type: entry.type,
      } as any);
    }
  }

  return formData;
}

export async function upload<T>(
  url: string,
  formData: FormData,
  config?: ApiRequestConfig,
): Promise<T> {
  return request<T>({
    ...config,
    method: 'POST',
    url,
    data: formData,
  });
}

export async function uploadFiles<T>(
  url: string,
  fields: Record<string, MultipartFieldValue | MultipartFieldValue[]>,
  config?: ApiRequestConfig,
): Promise<T> {
  return upload<T>(url, buildFormData(fields), config);
}
