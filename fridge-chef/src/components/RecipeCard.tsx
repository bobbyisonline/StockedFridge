import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
              <Feather name="clock" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{totalTime} min</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Feather name="users" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
            
            <Badge
              label={recipe.difficulty}
              variant={
                recipe.difficulty === 'Easy'
                  ? 'success'
                  : recipe.difficulty === 'Medium'
                  ? 'warning'
                  : 'danger'
              }
              size="small"
            />
          </View>
          
          {recipe.missingOptional && recipe.missingOptional.length > 0 && (
            <Text style={styles.missingOptional}>
              Optional: {recipe.missingOptional.join(', ')}
            </Text>
          )}
          
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
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 24,
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
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  missingOptional: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  moreText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
export default RecipeCard;