import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Records: undefined;
  Upload: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  TimelineDetails: { entry: TimelineEntry };
};

export type TimelineEntry = {
  id?: string;
  patientId?: string;
  docType?: string;
  date?: string;
  doctor?: string;
  findings?: Record<string, string> | string | string[] | null;
  diseases?: string[] | string | null;
  highlights?: string | null;
  treatment?: string | null;
  preDiagnosis?: string | null;
  createdAt?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
