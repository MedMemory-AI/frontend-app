import { ActivityIndicator, StyleSheet, Text, View, ViewProps } from 'react-native';

import { colors, spacing, textStyles } from '../theme';

type LoadingSpinnerProps = ViewProps & {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
};

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  fullScreen = false,
  message,
  style,
  ...props
}: LoadingSpinnerProps) {
  return (
    <View
      accessibilityLabel={message ?? 'Loading'}
      accessibilityRole="progressbar"
      style={[styles.container, fullScreen && styles.fullScreen, style]}
      {...props}
    >
      <ActivityIndicator color={color} size={size} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  message: {
    ...textStyles.bodySmall,
    textAlign: 'center',
  },
});
