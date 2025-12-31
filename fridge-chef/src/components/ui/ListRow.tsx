import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, LAYOUT } from '@/constants/theme';
import { Body, Caption } from './Typography';

interface ListRowProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * ListRow - Consistent row for ingredient/recipe items
 */
export function ListRow({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
}: ListRowProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      
      <View style={styles.content}>
        <Body numberOfLines={1}>{title}</Body>
        {subtitle && (
          <Caption numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Caption>
        )}
      </View>
      
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: LAYOUT.minTapTarget,
    marginBottom: SPACING.sm,
  },
  leftIcon: {
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginTop: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.md,
  },
});
