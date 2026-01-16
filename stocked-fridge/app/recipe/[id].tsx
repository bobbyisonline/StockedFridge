import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useRecipeStore } from '@/store/recipeStore';
import { IngredientList } from '@/components/IngredientList';
import { RecipeSteps } from '@/components/features/RecipeSteps';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, SPACING, LAYOUT } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { H1, H2, Body, Caption } from '@/components/ui/Typography';
import { Divider } from '@/components/ui/Divider';

export default function RecipeDetailScreen() {
  const { id, fromGeneration } = useLocalSearchParams<{ id: string; fromGeneration?: string }>();
  const router = useRouter();
  const { getRecipeById, deleteRecipe } = useRecipeStore();

  const recipe = id ? getRecipeById(id) : undefined;
  const isPreviewMode = fromGeneration === 'true';

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

  const handleBackToList = () => {
    if (!recipe) return;
    
    // Delete the preview recipe
    deleteRecipe(recipe.id);
    router.back();
  };

  const handleSaveRecipe = () => {
    if (!recipe) return;
    
    // Recipe is already in store (added for preview), just navigate to recipes list
    router.push('/(tabs)/recipes');
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
      <Screen>
        <LoadingSpinner message="Loading recipe..." />
      </Screen>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Screen padding={false} backgroundColor={COLORS.bg}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {recipe.imageUri && (
          <Image source={{ uri: recipe.imageUri }} style={styles.heroImage} />
        )}

        {/* Header */}
        <View style={styles.header}>
          <H1 style={styles.title}>{recipe.title}</H1>
          
          {recipe.description && (
            <Body style={styles.description}>{recipe.description}</Body>
          )}

          {/* Tags/Chips */}
          <View style={styles.tagsContainer}>
            {recipe.tags.map((tag) => (
              <Badge key={tag} label={tag} variant="primary" size="small" />
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="filled" padding="small">
            <View style={styles.statIconContainer}>
              <Feather name="clock" size={20} color={COLORS.primary} />
            </View>
            <Body style={styles.statValue}>{totalTime} min</Body>
            <Caption>Time</Caption>
          </Card>

          <Card style={styles.statCard} variant="filled" padding="small">
            <View style={styles.statIconContainer}>
              <Feather name="users" size={20} color={COLORS.primary} />
            </View>
            <Body style={styles.statValue}>{recipe.servings}</Body>
            <Caption>Servings</Caption>
          </Card>

          <Card style={styles.statCard} variant="filled" padding="small">
            <View style={styles.statIconContainer}>
              <Feather name="bar-chart-2" size={20} color={COLORS.primary} />
            </View>
            <Body style={styles.statValue}>{recipe.difficulty}</Body>
            <Caption>Difficulty</Caption>
          </Card>
        </View>

        {/* Nutrition */}
        {recipe.macros && (
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Nutrition</H2>
            <Card variant="filled">
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Body style={styles.nutritionValue}>{recipe.macros.calories}</Body>
                  <Caption>Calories</Caption>
                </View>
                <View style={styles.nutritionItem}>
                  <Body style={styles.nutritionValue}>{recipe.macros.protein}g</Body>
                  <Caption>Protein</Caption>
                </View>
                <View style={styles.nutritionItem}>
                  <Body style={styles.nutritionValue}>{recipe.macros.carbs}g</Body>
                  <Caption>Carbs</Caption>
                </View>
                <View style={styles.nutritionItem}>
                  <Body style={styles.nutritionValue}>{recipe.macros.fat}g</Body>
                  <Caption>Fat</Caption>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Ingredients</H2>
          <IngredientList ingredients={recipe.ingredients} showCategory />
        </View>

        <Divider />

        {/* Instructions */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Instructions</H2>
          <RecipeSteps steps={recipe.steps} />
        </View>

        {/* Bottom Actions */}
        <View style={styles.actions}>
          {isPreviewMode ? (
            <>
              <Button
                title="Save Recipe"
                onPress={handleSaveRecipe}
                variant="primary"
                fullWidth
              />
              
              <Button
                title="Back to List"
                onPress={handleBackToList}
                variant="outline"
                fullWidth
                style={styles.deleteButton}
              />
            </>
          ) : (
            <>
              <Button
                title="Share Recipe"
                onPress={handleShare}
                variant="primary"
                fullWidth
              />
              
              <Button
                title="Delete Recipe"
                onPress={handleDelete}
                variant="outline"
                fullWidth
                style={styles.deleteButton}
              />
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  heroImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  header: {
    padding: LAYOUT.screenPadding,
    paddingBottom: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.screenPadding,
    gap: SPACING.md,
    marginBottom: LAYOUT.sectionSpacing,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'center',
  },
  statIconContainer: {
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  section: {
    paddingHorizontal: LAYOUT.screenPadding,
    marginBottom: LAYOUT.sectionSpacing,
  },
  sectionTitle: {
    marginBottom: SPACING.lg,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '40%',
  },
  nutritionValue: {
    fontWeight: '600',
    color: COLORS.primary,
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  actions: {
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  deleteButton: {
    borderColor: COLORS.danger,
    marginBottom: SPACING.sm,
  },
});
