import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';
import { H3, Body } from './Typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState - Consistent empty state with icon, message, and optional CTA
 */
export function EmptyState({
  icon = '📭',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Body style={styles.icon}>{icon}</Body>
      </View>
      
      <H3 style={styles.title}>{title}</H3>
      <Body style={styles.message}>{message}</Body>
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.xxxl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  message: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginBottom: SPACING.xxl,
  },
  button: {
    minWidth: 200,
  },
});
