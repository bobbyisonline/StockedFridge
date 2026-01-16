// Design System - "Modern Grocery + Recipe Assistant"
// High contrast, warm neutrals, clean hierarchy

export const COLORS = {
  // Background & Surfaces
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceMuted: '#F3F4F6',
  
  // Brand - Emerald Green (fresh, food-related)
  primary: '#10B981',
  primarySoft: '#D1FAE5',
  
  // Semantic
  danger: '#EF4444',
  
  // Text Hierarchy
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  
  // UI Elements
  border: '#E5E7EB',
  
  // Deprecated - keeping for compatibility during refactor
  bg: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  primaryMuted: '#D1FAE5',
  primaryDark: '#059669',
  primaryTextOn: '#FFFFFF',
  secondary: '#F59E0B',
  dangerMuted: '#FEE2E2',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  success: '#10B981',
  successMuted: '#D1FAE5',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  divider: '#F3F4F6',
  disabled: '#D1D5DB',
  disabledText: '#9CA3AF',
  difficultyEasy: '#10B981',
  difficultyMedium: '#F59E0B',
  difficultyHard: '#EF4444',
};

// Spacing Scale - 4, 8, 12, 16, 20, 24, 32
export const SPACING = {
  xs: 4,    // 4
  sm: 8,    // 8
  md: 12,   // 12
  lg: 16,   // 16
  xl: 20,   // 20
  xxl: 24,  // 24
  xxxl: 32, // 32
};

// Typography - Reusable text styles
export const TYPOGRAPHY = {
  screenTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMuted: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  
  // Aliases for compatibility
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  captionMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  chipLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
};

// Legacy font sizes (for gradual migration)
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius - Softer, more rounded
export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// Elevation Shadows - Consistent, subtle
export const SHADOWS = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Layout Constants
export const LAYOUT = {
  screenPadding: SPACING.lg, // 16px
  cardPadding: SPACING.lg, // 16px
  sectionSpacing: SPACING.xxl, // 24px
  minTapTarget: 44, // Accessibility minimum
};
