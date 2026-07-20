import { DefaultTheme, Theme } from '@react-navigation/native';

import { colors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { layout, spacing } from './spacing';
import { fontSizes, fontWeights, lineHeights, textStyles, typography } from './typography';

export { colors, type ColorName } from './colors';
export { layout, spacing, type SpacingName } from './spacing';
export {
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
  typography,
} from './typography';
export { radius, type RadiusName } from './radius';
export { shadows, type ShadowName } from './shadows';

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.secondary,
  },
};

export const theme = {
  colors,
  spacing,
  layout,
  fontSizes,
  fontWeights,
  lineHeights,
  typography,
  textStyles,
  radius,
  shadows,
  navigation: navigationTheme,
} as const;

export type AppTheme = typeof theme;
