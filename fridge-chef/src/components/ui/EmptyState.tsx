import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/constants/theme';
import { H3, Body } from './Typography';
import { Button } from './Button';

interface EmptyStateProps {
  /**
   * Icon name from Feather icon set (e.g. 'inbox', 'search', 'alert-circle')
   * See: https://feathericons.com/
   */
  iconName?: keyof typeof Feather.glyphMap;
  /**
   * Primary heading describing the empty state
   */
  title: string;
  /**
   * Optional description providing guidance or context
   */
  description?: string;
  /**
   * Optional action button label
   */
  actionLabel?: string;
  /**
   * Optional action button callback
   */
  onAction?: () => void;
  /**
   * Compact mode for use in bottom sheets or constrained spaces
   */
  compact?: boolean;
}

/**
 * EmptyState - Layout-safe empty state component with consistent styling
 * 
 * Features:
 * - Simple outline icons (Feather) for visual consistency
 * - Responsive sizing for bottom sheets and full screens
 * - Clear copy guidelines: title describes state, description explains next steps
 * - Optional action button for primary CTA
 * 
 * Usage:
 * - Full screen: <EmptyState iconName="inbox" title="No items yet" />
 * - Bottom sheet: <EmptyState iconName="search" title="No results" compact />
 * - With action: <EmptyState iconName="camera" onAction={scan} actionLabel="Scan" />
 */
export function EmptyState({
  iconName,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {iconName && (
        <View style={[styles.iconContainer, compact && styles.iconContainerCompact]}>
          <Feather 
            name={iconName} 
            size={compact ? 32 : 48} 
            color={COLORS.textMuted} 
          />
        </View>
      )}
      
      <H3 style={StyleSheet.flatten([styles.title, compact && styles.titleCompact])}>{title}</H3>
      
      {description && (
        <Body style={StyleSheet.flatten([styles.description, compact && styles.descriptionCompact])}>
          {description}
        </Body>
      )}
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size={compact ? 'small' : 'medium'}
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  containerCompact: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  iconContainerCompact: {
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  titleCompact: {
    marginBottom: SPACING.sm,
  },
  description: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  descriptionCompact: {
    marginBottom: SPACING.md,
  },
  button: {
    minWidth: 160,
    marginTop: SPACING.sm,
  },
});
