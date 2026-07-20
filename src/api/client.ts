import axios from 'axios';

import { API_BASE_URL, API_TIMEOUT_MS } from '../constants';

import { setupInterceptors } from './interceptors';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);

export type ApiClient = typeof apiClient;
