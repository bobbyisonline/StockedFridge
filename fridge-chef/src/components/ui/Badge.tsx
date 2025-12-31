import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { RecipeTag as RecipeTagType } from '@/types';

interface BadgeProps {
  label: string | RecipeTagType;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

/**
 * Badge/Chip - Small tag/category pill
 */
export function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  style,
}: BadgeProps) {
  const badgeStyles = [
    styles.badge,
    styles[`badge_${variant}`],
    styles[`badge_${size}`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badge_primary: {
    backgroundColor: COLORS.primaryMuted,
  },
  badge_secondary: {
    backgroundColor: COLORS.warningMuted,
  },
  badge_success: {
    backgroundColor: COLORS.successMuted,
  },
  badge_warning: {
    backgroundColor: COLORS.warningMuted,
  },
  badge_danger: {
    backgroundColor: COLORS.dangerMuted,
  },
  badge_info: {
    backgroundColor: COLORS.infoMuted,
  },
  badge_neutral: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge_small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
  },
  badge_medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.chipLabel.fontSize,
    lineHeight: TYPOGRAPHY.chipLabel.lineHeight,
    fontWeight: TYPOGRAPHY.chipLabel.fontWeight,
    includeFontPadding: false,
  },
  text_primary: {
    color: COLORS.primary,
  },
  text_secondary: {
    color: COLORS.warning,
  },
  text_success: {
    color: COLORS.success,
  },
  text_warning: {
    color: COLORS.warning,
  },
  text_danger: {
    color: COLORS.danger,
  },
  text_info: {
    color: COLORS.info,
  },
  text_neutral: {
    color: COLORS.text,
  },
  text_small: {
    fontSize: TYPOGRAPHY.small.fontSize,
  },
  text_medium: {
    fontSize: TYPOGRAPHY.chipLabel.fontSize,
  },
});
