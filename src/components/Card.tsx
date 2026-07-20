import { Pressable, PressableProps, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type CardOptions = {
  padding?: CardPadding;
  elevated?: boolean;
  bordered?: boolean;
};

type StaticCardProps = CardOptions &
  ViewProps & {
    onPress?: undefined;
  };

type PressableCardProps = CardOptions &
  Omit<PressableProps, 'style' | 'children'> & {
    onPress: NonNullable<PressableProps['onPress']>;
    style?: PressableProps['style'];
    children?: PressableProps['children'];
  };

export type CardProps = StaticCardProps | PressableCardProps;

const paddingMap: Record<CardPadding, number> = {
  none: spacing.none,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

function getCardStyle(
  padding: CardPadding,
  elevated: boolean,
  bordered: boolean,
): ViewStyle[] {
  return [
    styles.card,
    { padding: paddingMap[padding] },
    elevated ? shadows.md : shadows.none,
    bordered ? styles.bordered : null,
  ].filter(Boolean) as ViewStyle[];
}

export function Card(props: CardProps) {
  const padding = props.padding ?? 'md';
  const elevated = props.elevated ?? true;
  const bordered = props.bordered ?? false;
  const cardStyle = getCardStyle(padding, elevated, bordered);

  if (props.onPress) {
    const { children, onPress, style, ...pressableRest } = props as PressableCardProps;

    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
          typeof style === 'function' ? style({ pressed }) : style,
        ]}
        {...pressableRest}
      >
        {children}
      </Pressable>
    );
  }

  const { children, style, ...viewRest } = props as StaticCardProps;

  return (
    <View style={[...cardStyle, style as ViewStyle]} {...viewRest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bordered: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.92,
  },
});
