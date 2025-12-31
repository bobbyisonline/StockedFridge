import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { IngredientList } from '@/components/IngredientList';
import { RecipeSteps } from '@/components/features/RecipeSteps';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRecipeById, deleteRecipe } = useRecipeStore();

  const recipe = id ? getRecipeById(id) : undefined;

  const handleShare = async () => {
    if (!recipe) return;

    try {
      const message = `Check out this recipe: ${recipe.title}\n\nIngredients:\n${recipe.ingredients
        .map((ing) => `• ${ing.quantity} ${ing.unit} ${ing.name}`)
        .join('\n')}`;

      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const handleDelete = () => {
    if (!recipe) return;

    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(recipe.id);
            router.back();
          },
        },
      ]
    );
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading recipe..." />
      </SafeAreaView>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {recipe.imageUri && (
          <Image source={{ uri: recipe.imageUri }} style={styles.heroImage} />
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}

          <View style={styles.tagsContainer}>
            {recipe.tags.map((tag) => (
              <Badge key={tag} label={tag} variant="primary" size="small" />
            ))}
          </View>
        </View>

        {/* Meta Info */}
        <Card style={styles.card}>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaLabel}>Total Time</Text>
              <Text style={styles.metaValue}>{totalTime} min</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🍽️</Text>
              <Text style={styles.metaLabel}>Servings</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📊</Text>
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={styles.metaValue}>{recipe.difficulty}</Text>
            </View>
          </View>
        </Card>

        {/* Macros */}
        {recipe.macros && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Nutrition</Text>
            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{recipe.macros.calories}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{recipe.macros.protein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{recipe.macros.carbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{recipe.macros.fat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Ingredients */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <IngredientList ingredients={recipe.ingredients} showCategory />
        </Card>

        {/* Steps */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <RecipeSteps steps={recipe.steps} />
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Share Recipe"
            onPress={handleShare}
            variant="primary"
            fullWidth
            style={styles.actionButton}
          />
          
          <Button
            title="Delete Recipe"
            onPress={handleDelete}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  metaLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  actions: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
});
