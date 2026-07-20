import { create } from 'zustand';

type UiState = {
  isLoading: boolean;
  errorMessage: string | null;
};

type UiActions = {
  setLoading: (isLoading: boolean) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  clearError: () => void;
};

export type UiStore = UiState & UiActions;

const initialState: UiState = {
  isLoading: false,
  errorMessage: null,
};

export const useUiStore = create<UiStore>((set) => ({
  ...initialState,
  setLoading: (isLoading) => set({ isLoading }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  clearError: () => set({ errorMessage: null }),
}));
