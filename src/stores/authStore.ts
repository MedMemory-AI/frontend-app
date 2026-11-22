import { create } from 'zustand';

import {
  loginRequest,
  registerRequest,
  verifyOtpRequest,
  type AuthData,
  type MeProfileData,
  type RegisterRequest,
} from '../api/auth';
import { isApiError } from '../api/errors';
import { clearTokens, getAccessToken, getStoredUser, setAccessToken, setStoredUser } from '../api/tokenStorage';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isAwaitingOtp: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  loginAsGuest: () => void;
  exitGuestMode: () => void;
};

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAwaitingOtp: false,
  isHydrated: false,
  isLoading: false,
  error: null,
  isGuest: false,
};

function mapAuthDataToUser(data: AuthData | MeProfileData): User {
  return {
    id: data.id,
    email: data.email,
    fullName: data.fullName,
    isVerified: data.isVerified,
  };
}

async function persistSession(data: AuthData): Promise<User> {
  const user = mapAuthDataToUser({ ...data, isVerified: false });
  await setAccessToken(data.accessToken);
  await setStoredUser(user);
  return user;
}

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const data = await loginRequest({ email, password });
      const user = await persistSession(data);

      set({
        user,
        isAuthenticated: false,
        isAwaitingOtp: true,
        isGuest: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const data = await registerRequest(payload);
      const user = await persistSession(data);

      set({
        user,
        isAuthenticated: false,
        isAwaitingOtp: true,
        isGuest: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      throw error;
    }
  },

  verifyOtp: async (otp) => {
    set({ isLoading: true, error: null });

    try {
      const data = await verifyOtpRequest({ otp });
      const user = mapAuthDataToUser({ ...data, isVerified: true });
      await setStoredUser(user);

      set({
        user,
        isAuthenticated: true,
        isAwaitingOtp: false,
        isGuest: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      throw error;
    }
  },

  logout: async () => {
    await clearTokens();
    set({
      ...initialState,
      isHydrated: true,
      isGuest: false,
    });
  },

  initialize: async () => {
    try {
      const [token, user] = await Promise.all([getAccessToken(), getStoredUser()]);

      if (token && user) {
        const isVerified = user.isVerified !== false;

        set({
          user,
          isAuthenticated: isVerified,
          isAwaitingOtp: !isVerified,
          isHydrated: true,
          isLoading: false,
          error: null,
          isGuest: false,
        });
        return;
      }

      await clearTokens();
      set({
        ...initialState,
        isHydrated: true,
        isGuest: false,
      });
    } catch {
      await clearTokens();
      set({
        ...initialState,
        isHydrated: true,
        isGuest: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  loginAsGuest: () => {
    set({
      user: {
        id: 'demo-user-id',
        fullName: 'Demo User',
        email: 'user@example.com',
      },
      isAuthenticated: false,
      isGuest: true,
      error: null,
    });
  },

  exitGuestMode: () => {
    set({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      error: null,
    });
  },
}));
