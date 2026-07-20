export const storageKeys = {
  accessToken: 'medmemory.accessToken',
  refreshToken: 'medmemory.refreshToken',
  user: 'medmemory.user',
  onboardingComplete: 'medmemory.onboardingComplete',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
