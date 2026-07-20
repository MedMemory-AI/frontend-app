import { api } from './request';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type AuthData = {
  id: string;
  fullName: string;
  email: string;
  accessToken: string;
  tokenType: string;
};

export async function loginRequest(payload: LoginRequest): Promise<AuthData> {
  return api.post<AuthData>('/auth/login', payload, { skipAuth: true });
}

export async function registerRequest(payload: RegisterRequest): Promise<AuthData> {
  return api.post<AuthData>('/auth/register', payload, { skipAuth: true });
}
