import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
  children,
  style,
  variant = 'elevated',
  padding = 'medium',
}: CardProps) {
  const cardStyles = [
    styles.card,
    styles[`card_${variant}`],
    styles[`padding_${padding}`],
    variant === 'elevated' && SHADOWS.md,
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  card_elevated: {
    backgroundColor: COLORS.background,
  },
  card_outlined: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  card_filled: {
    backgroundColor: COLORS.surface,
  },
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: SPACING.sm,
  },
  padding_medium: {
    padding: SPACING.md,
  },
  padding_large: {
    padding: SPACING.lg,
  },
});
