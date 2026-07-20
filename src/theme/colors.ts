export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  primaryMuted: '#EFF6FF',

  secondary: '#0D9488',
  secondaryDark: '#0F766E',
  secondaryLight: '#CCFBF1',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#2563EB',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  divider: '#F1F5F9',

  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  overlay: 'rgba(15, 23, 42, 0.5)',
  scrim: 'rgba(15, 23, 42, 0.32)',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;
