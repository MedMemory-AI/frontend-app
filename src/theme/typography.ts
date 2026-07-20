import { TextStyle } from 'react-native';

import { colors } from './colors';

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const typography = {
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold,
    lineHeight: 32,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: 26,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  },
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
} as const satisfies Record<string, TextStyle>;

export const textStyles = {
  display: { ...typography.display, color: colors.text },
  h1: { ...typography.h1, color: colors.text },
  h2: { ...typography.h2, color: colors.text },
  h3: { ...typography.h3, color: colors.text },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.subtitle, color: colors.textSecondary },
  body: { ...typography.body, color: colors.text },
  bodySmall: { ...typography.bodySmall, color: colors.textSecondary },
  label: { ...typography.label, color: colors.text },
  caption: { ...typography.caption, color: colors.textSecondary },
  overline: { ...typography.overline, color: colors.textTertiary },
  link: { ...typography.body, color: colors.textLink },
  inverse: { ...typography.body, color: colors.textInverse },
  button: { ...typography.button, color: colors.textInverse },
  error: { ...typography.bodySmall, color: colors.error },
} as const satisfies Record<string, TextStyle>;
