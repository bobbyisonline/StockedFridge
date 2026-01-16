import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, LAYOUT } from '@/constants/theme';

interface IconButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/**
 * IconButton - Circular button for icon-only actions
 */
export function IconButton({
  children,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: IconButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.primaryTextOn : COLORS.primary}
          size="small"
        />
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  
  // Variants
  button_default: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_danger: {
    backgroundColor: COLORS.dangerMuted,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  button_small: {
    width: 32,
    height: 32,
  },
  button_medium: {
    width: 40,
    height: 40,
  },
  button_large: {
    width: LAYOUT.minTapTarget,
    height: LAYOUT.minTapTarget,
  },
  
  disabled: {
    opacity: 0.5,
  },
});
