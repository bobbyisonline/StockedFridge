import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { RecipeStep as RecipeStepType } from '@/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface RecipeStepsProps {
  steps: RecipeStepType[];
  style?: ViewStyle;
}

export function RecipeSteps({ steps, style }: RecipeStepsProps) {
  return (
    <View style={[styles.container, style]}>
      {steps.map((step) => (
        <View key={step.stepNumber} style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
          </View>
          
          <View style={styles.stepContent}>
            <Text style={styles.stepInstruction}>{step.instruction}</Text>
            
            {(step.duration || step.temperature) && (
              <View style={styles.metaContainer}>
                {step.duration && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱️</Text>
                    <Text style={styles.metaText}>{step.duration} min</Text>
                  </View>
                )}
                
                {step.temperature && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🌡️</Text>
                    <Text style={styles.metaText}>
                      {step.temperature.value}°{step.temperature.unit === 'celsius' ? 'C' : 'F'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: FONT_SIZES.md * 1.6,
    marginBottom: SPACING.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaIcon: {
    fontSize: FONT_SIZES.sm,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
