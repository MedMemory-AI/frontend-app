import { LogOut, Mail, User } from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, GlobalHeader, LoadingSpinner, ScreenContainer } from '../../components';
import { useAuthStore } from '../../stores';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const exitGuestMode = useAuthStore((state) => state.exitGuestMode);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!user) {
    return (
      <ScreenContainer centered>
        <LoadingSpinner message="Loading profile..." />
      </ScreenContainer>
    );
  }

  const handleLogout = () => {
    if (isGuest) {
      exitGuestMode();
      return;
    }
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Unable to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'US';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScreenContainer scrollable safeAreaTop={false} padded={false}>
      <GlobalHeader />
      <View style={styles.content}>
        {/* Profile Card Header with Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user.fullName)}</Text>
          </View>
          <Text style={styles.profileName}>{user.fullName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>

        {/* User Information Details Card */}
        <Card padding="none" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <User color={colors.primary} size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user.fullName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Mail color={colors.primary} size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        </Card>

        {/* Logout Action Button */}
        <Pressable
          onPress={handleLogout}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
            isLoading && styles.disabledButton,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isGuest ? 'Exit Demo Mode' : 'Log out of account'}
        >
          <LogOut size={18} color={colors.textInverse} />
          <Text style={styles.logoutButtonText}>
            {isGuest ? 'Exit Demo Mode' : isLoading ? 'Logging out...' : 'Log Out'}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primaryLight,
    marginBottom: spacing.xs,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    ...textStyles.h2,
    color: colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  profileName: {
    ...textStyles.h3,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileEmail: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: spacing.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoValue: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginHorizontal: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    ...textStyles.label,
    color: colors.textInverse,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
