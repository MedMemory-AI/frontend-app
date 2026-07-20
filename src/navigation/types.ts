import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Upload: undefined;
  Timeline: undefined;
  AIChat: undefined;
  Profile: undefined;
};

export type TimelineEntry = {
  id?: string;
  title?: string;
  summary?: string;
  description?: string;
  content?: string;
  body?: string;
  createdAt?: string;
  date?: string;
  type?: string;
  category?: string;
  status?: string;
  doctor?: string;
  hospital?: string;
  symptoms?: string | string[];
  diagnosis?: string | string[];
  treatment?: string | string[];
  findings?: string | string[];
  medicines?: string | string[];
  notes?: string | string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  TimelineDetails: { entry: TimelineEntry };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
