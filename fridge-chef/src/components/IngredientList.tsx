import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ingredient } from '@/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface IngredientListProps {
  ingredients: Ingredient[];
  style?: ViewStyle;
  showCategory?: boolean;
}

export function IngredientList({ 
  ingredients, 
  style,
  showCategory = false,
}: IngredientListProps) {
  // Group by category if showCategory is true
  const groupedIngredients = showCategory
    ? ingredients.reduce((acc, ing) => {
        const category = ing.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(ing);
        return acc;
      }, {} as Record<string, Ingredient[]>)
    : { all: ingredients };

  return (
    <View style={[styles.container, style]}>
      {Object.entries(groupedIngredients).map(([category, items]) => (
        <View key={category} style={styles.categorySection}>
          {showCategory && category !== 'all' && (
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          )}
          {items.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientRow}>
              <View style={styles.bullet} />
              <View style={styles.ingredientContent}>
                <Text style={styles.ingredientText}>
                  <Text style={styles.quantity}>
                    {ingredient.quantity} {ingredient.unit}
                  </Text>
                  {' '}
                  <Text style={styles.name}>{ingredient.name}</Text>
                  {ingredient.isOptional && (
                    <Text style={styles.optional}> (optional)</Text>
                  )}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  categorySection: {
    marginBottom: SPACING.md,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'capitalize',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientText: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  quantity: {
    fontWeight: '600',
    color: COLORS.text,
  },
  name: {
    color: COLORS.text,
  },
  optional: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    fontSize: FONT_SIZES.sm,
  },
});