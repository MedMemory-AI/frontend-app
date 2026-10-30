import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { storageKeys } from '../constants';
import type { User } from '../types';

// Helper wrapper to handle Web vs Native storage transparently
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export async function getAccessToken(): Promise<string | null> {
  return storage.getItem(storageKeys.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return storage.getItem(storageKeys.refreshToken);
}

export async function setAccessToken(token: string): Promise<void> {
  await storage.setItem(storageKeys.accessToken, token);
}

export async function setRefreshToken(token: string): Promise<void> {
  await storage.setItem(storageKeys.refreshToken, token);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([setAccessToken(accessToken), setRefreshToken(refreshToken)]);
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await storage.getItem(storageKeys.user);

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
  await storage.setItem(storageKeys.user, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await storage.removeItem(storageKeys.user);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    storage.removeItem(storageKeys.accessToken),
    storage.removeItem(storageKeys.refreshToken),
    clearStoredUser(),
  ]);
}
