export const colors = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  dark: {
    surface: '#0f1a17',
    surfaceElevated: '#1a2823',
    surfaceSecondary: '#15201d',
    border: '#2a3a34',
    text: '#f0fdf4',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
  },
  light: {
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceSecondary: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
  },
} as const;

export const typography = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    fontSize: 24,
    lineHeight: 30,
  },
  subheading: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
  },
  small: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

export const componentTokens = {
  tabBar: {
    height: 60,
    activeColor: colors.primary[600],
    inactiveColor: colors.neutral[400],
  },
  card: {
    padding: spacing.md,
    radius: radius.lg,
    backgroundColor: colors.light.surface,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    backgroundColor: colors.light.surface,
  },
  button: {
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
} as const;
