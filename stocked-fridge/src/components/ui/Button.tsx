import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, LAYOUT } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    textStyle,
  ];

  const getLoaderColor = () => {
    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      return COLORS.primaryTextOn;
    }
    return COLORS.primary;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    minHeight: LAYOUT.minTapTarget,
  },
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button_tertiary: {
    backgroundColor: 'transparent',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  button_danger: {
    backgroundColor: COLORS.danger,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    minHeight: 36,
  },
  button_medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  button_large: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '600',
  },
  text_primary: {
    color: COLORS.primaryTextOn,
  },
  text_secondary: {
    color: COLORS.text,
  },
  text_tertiary: {
    color: COLORS.textMuted,
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_danger: {
    color: COLORS.primaryTextOn,
  },
  text_ghost: {
    color: COLORS.primary,
  },
  text_small: {
    fontSize: TYPOGRAPHY.caption.fontSize,
  },
  text_medium: {
    fontSize: TYPOGRAPHY.body.fontSize,
  },
  text_large: {
    fontSize: TYPOGRAPHY.h3.fontSize,
  },
});
