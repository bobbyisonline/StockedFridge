import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';

interface DividerProps {
  style?: ViewStyle;
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * Divider - Subtle separator line
 */
export function Divider({ style, spacing = 'medium' }: DividerProps) {
  return (
    <View style={[styles.container, styles[`spacing_${spacing}`], style]}>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  line: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  spacing_none: {
    marginVertical: 0,
  },
  spacing_small: {
    marginVertical: SPACING.sm,
  },
  spacing_medium: {
    marginVertical: SPACING.lg,
  },
  spacing_large: {
    marginVertical: SPACING.xxl,
  },
});
