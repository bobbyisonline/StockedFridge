import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, LAYOUT } from '@/constants/theme';
import { Caption } from './Typography';

interface TextFieldProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
}

/**
 * TextField - Consistent text input with label, icons, and clear button
 */
export function TextField({
  label,
  leftIcon,
  rightIcon,
  onClear,
  showClearButton = false,
  error,
  containerStyle,
  style,
  ...textInputProps
}: TextFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Caption style={styles.label}>{label}</Caption>}
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeftIcon : undefined, style]}
          placeholderTextColor={COLORS.textLight}
          {...textInputProps}
        />
        
        {showClearButton && textInputProps.value && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Caption color={COLORS.textMuted}>✕</Caption>
          </TouchableOpacity>
        )}
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Caption style={styles.errorText}>{error}</Caption>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: LAYOUT.minTapTarget,
    paddingHorizontal: SPACING.lg,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.body.fontSize,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
  clearButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  errorText: {
    marginTop: SPACING.xs,
    color: COLORS.danger,
  },
});
