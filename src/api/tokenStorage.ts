import * as SecureStore from 'expo-secure-store';

import { storageKeys } from '../constants';
import type { User } from '../types';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(storageKeys.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(storageKeys.refreshToken);
}

export async function setAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(storageKeys.accessToken, token);
}

export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(storageKeys.refreshToken, token);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([setAccessToken(accessToken), setRefreshToken(refreshToken)]);
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(storageKeys.user);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(storageKeys.user, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await SecureStore.deleteItemAsync(storageKeys.user);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(storageKeys.accessToken),
    SecureStore.deleteItemAsync(storageKeys.refreshToken),
    clearStoredUser(),
  ]);
}
