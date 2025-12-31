import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { H2, Caption } from './Typography';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

/**
 * SectionHeader - Consistent section title with optional subtitle and right element
 */
export function SectionHeader({ title, subtitle, rightElement }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <H2 style={styles.title}>{title}</H2>
        {subtitle && <Caption style={styles.subtitle}>{subtitle}</Caption>}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textMuted,
  },
  rightElement: {
    marginLeft: SPACING.lg,
  },
});
