import {
  Bot,
  Clock,
  Home,
  Upload,
  User,
} from 'lucide-react-native';

import { colors } from '../theme';

import type { MainTabParamList } from './types';

type TabRouteName = keyof MainTabParamList;

const iconMap: Record<TabRouteName, typeof Home> = {
  Home,
  Upload,
  Timeline: Clock,
  AIChat: Bot,
  Profile: User,
};

const labelMap: Record<TabRouteName, string> = {
  Home: 'Home',
  Upload: 'Upload',
  Timeline: 'Timeline',
  AIChat: 'AI Chat',
  Profile: 'Profile',
};

export function renderTabIcon(routeName: string, isFocused: boolean) {
  const Icon = iconMap[routeName as TabRouteName] ?? Home;

  return (
    <Icon
      color={isFocused ? colors.primary : colors.textSecondary}
      size={20}
      strokeWidth={isFocused ? 2.5 : 2}
    />
  );
}

export function renderTabLabel(routeName: string) {
  return labelMap[routeName as TabRouteName] ?? routeName;
}
