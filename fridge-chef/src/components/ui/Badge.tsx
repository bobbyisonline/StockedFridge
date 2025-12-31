import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/constants/theme';
import { RecipeTag as RecipeTagType } from '@/types';

interface BadgeProps {
  label: string | RecipeTagType;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

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
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badge_primary: {
    backgroundColor: `${COLORS.primary}20`,
  },
  badge_secondary: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  badge_success: {
    backgroundColor: `${COLORS.success}20`,
  },
  badge_warning: {
    backgroundColor: `${COLORS.warning}20`,
  },
  badge_error: {
    backgroundColor: `${COLORS.error}20`,
  },
  badge_info: {
    backgroundColor: `${COLORS.info}20`,
  },
  badge_small: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
  },
  text: {
    fontWeight: '600',
  },
  text_primary: {
    color: COLORS.primary,
  },
  text_secondary: {
    color: COLORS.secondary,
  },
  text_success: {
    color: COLORS.success,
  },
  text_warning: {
    color: COLORS.warning,
  },
  text_error: {
    color: COLORS.error,
  },
  text_info: {
    color: COLORS.info,
  },
  text_small: {
    fontSize: FONT_SIZES.xs,
  },
  text_medium: {
    fontSize: FONT_SIZES.sm,
  },
});
