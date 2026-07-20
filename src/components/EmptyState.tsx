import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

import { colors, radius, spacing, textStyles } from '../theme';

import { PrimaryButton } from './PrimaryButton';

type EmptyStateProps = ViewProps & {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
  ...props
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton
          fullWidth={false}
          label={actionLabel}
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64,
  },
  title: {
    ...textStyles.h3,
    textAlign: 'center',
  },
  description: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.lg,
    minWidth: 160,
  },
});
