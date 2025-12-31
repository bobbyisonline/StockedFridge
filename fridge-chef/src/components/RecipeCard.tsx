import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Recipe } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {recipe.imageUri && (
          <Image source={{ uri: recipe.imageUri }} style={styles.image} />
        )}
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          
          {recipe.description && (
            <Text style={styles.description} numberOfLines={2}>
              {recipe.description}
            </Text>
          )}
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>🕐</Text>
              <Text style={styles.metaText}>{totalTime} min</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>🍽️</Text>
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
            
            <Badge
              label={recipe.difficulty}
              variant={
                recipe.difficulty === 'Easy'
                  ? 'success'
                  : recipe.difficulty === 'Medium'
                  ? 'warning'
                  : 'error'
              }
              size="small"
            />
          </View>
          
          <View style={styles.tagsContainer}>
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} label={tag} variant="primary" size="small" />
            ))}
            {recipe.tags.length > 3 && (
              <Text style={styles.moreText}>+{recipe.tags.length - 3} more</Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaLabel: {
    fontSize: FONT_SIZES.md,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  moreText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
export default RecipeCard;