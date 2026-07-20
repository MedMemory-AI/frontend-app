import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HeartPulse } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { MainTabParamList } from '../navigation/types';
import type { AppTabNavigationProp } from '../navigation/createTabNavigator';
import { useAuthStore } from '../stores';

type GlobalHeaderProps = {
  subtitle?: string;
  rightAction?: React.ReactNode;
};

export function GlobalHeader({ subtitle, rightAction }: GlobalHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AppTabNavigationProp<MainTabParamList, 'Home'>>();
  const isGuest = useAuthStore((state) => state.isGuest);

  const handlePressLogo = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Pressable onPress={handlePressLogo} style={styles.logoContainer}>
          <View style={styles.iconBackground}>
            <HeartPulse size={20} color={colors.primary} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.appName}>MedMemory AI</Text>
              {isGuest ? (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>Demo</Text>
                </View>
              ) : null}
            </View>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </Pressable>
        <View style={styles.rightActionContainer}>
          {rightAction || null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    ...typography.label,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  demoBadge: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
    borderWidth: 0.5,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: colors.warning,
    textTransform: 'uppercase',
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    marginTop: -2,
  },
  rightActionContainer: {
    minWidth: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
