import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import { colors, radius, spacing, textStyles } from '../theme';
import { PrimaryButton } from './PrimaryButton';

type ErrorStateProps = ViewProps & {
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  actionLabel = 'Retry',
  onRetry,
  style,
  ...props
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.iconContainer}>
        <AlertCircle color={colors.error} size={32} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <PrimaryButton
          fullWidth={false}
          label={actionLabel}
          onPress={onRetry}
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
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64,
  },
  title: {
    ...textStyles.h3,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: spacing.lg,
    minWidth: 140,
  },
});
