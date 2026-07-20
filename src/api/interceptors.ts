import {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore } from '../stores';

import { ApiError, parseApiError } from './errors';
import { getAccessToken } from './tokenStorage';

function isFormData(data: unknown): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData;
}

async function attachAccessToken(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  if (config.skipAuth) {
    return config;
  }

  const token = await getAccessToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  if (isFormData(config.data)) {
    config.headers.delete('Content-Type');
  }

  return config;
}

async function handleUnauthorized(): Promise<void> {
  await useAuthStore.getState().logout();
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config) => attachAccessToken(config),
    (error: AxiosError) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const apiError = parseApiError(error);

      if (apiError.status === 401 && !error.config?.skipAuth) {
        await handleUnauthorized();
      }

      return Promise.reject(apiError);
    },
  );
}

export { ApiError };
