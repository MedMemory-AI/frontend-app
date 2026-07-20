import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '../theme';

type ScreenContainerProps = ViewProps & {
  centered?: boolean;
  scrollable?: boolean;
  padded?: boolean;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
};

export function ScreenContainer({
  centered = false,
  scrollable = false,
  padded = true,
  safeAreaTop = true,
  safeAreaBottom = true,
  style,
  children,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const contentStyle = [
    padded && styles.padded,
    safeAreaTop && { paddingTop: Math.max(insets.top, spacing.md) },
    safeAreaBottom && { paddingBottom: Math.max(insets.bottom, spacing.md) },
    centered && styles.centered,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={[...contentStyle, styles.scrollContent]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, ...contentStyle, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
