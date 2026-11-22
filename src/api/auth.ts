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

export type VerifyOtpRequest = {
  otp: string;
};

export type AuthData = {
  id: string;
  fullName: string;
  email: string;
  isVerified?: boolean;
  accessToken: string;
  tokenType?: string;
};

export type MeProfileData = {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
};

export async function loginRequest(payload: LoginRequest): Promise<AuthData> {
  return api.post<AuthData>('/auth/login', payload, { skipAuth: true });
}

export async function registerRequest(payload: RegisterRequest): Promise<AuthData> {
  return api.post<AuthData>('/auth/register', payload, { skipAuth: true });
}

export async function verifyOtpRequest(payload: VerifyOtpRequest): Promise<MeProfileData> {
  return api.post<MeProfileData>('/auth/verify-otp', payload);
}
