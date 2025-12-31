import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useRecipeStore } from '@/store/recipeStore';
import { useFridgeStore } from '@/store/fridgeStore';
import { RecipeCard } from '@/components/RecipeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LLMService } from '@/services/LLMService';
import { SuggestionsSheet, SuggestionsSheetRef } from '@/components/features/SuggestionsSheet';
import { COLORS, SPACING, LAYOUT } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { TextField } from '@/components/ui/TextField';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RecipesScreen() {
  const router = useRouter();
  const { recipes, isLoading, searchRecipes, deleteRecipe, addRecipe } = useRecipeStore();
  const { items: fridgeItems, loadItems } = useFridgeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedRecipes, setGeneratedRecipes] = useState<string[] | null>(null);
  const [lastFridgeSnapshot, setLastFridgeSnapshot] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingRecipe, setGeneratingRecipe] = useState<string | null>(null);
  const sheetRef = useRef<SuggestionsSheetRef>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (generatedRecipes && generatedRecipes.length > 0) {
      sheetRef.current?.present();
    }
  }, [generatedRecipes]);

  const filteredRecipes = searchQuery
    ? searchRecipes(searchQuery)
    : recipes;

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleGenerateRecipes = async () => {
    if (fridgeItems.length === 0) {
      Alert.alert('Empty Fridge', 'Add some ingredients first to generate recipes!');
      return;
    }

    const ingredientNames = fridgeItems.map(item => item.name);
    const fridgeChanged = JSON.stringify(lastFridgeSnapshot) !== JSON.stringify(ingredientNames);

    // If fridge hasn't changed and we have cached recipes, show them
    if (!fridgeChanged && generatedRecipes && generatedRecipes.length > 0) {
      console.log('[Recipes] Reusing cached recipe ideas');
      sheetRef.current?.present();
      return;
    }

    setIsGenerating(true);
    try {
      const llmService = new LLMService();
      console.log('[Recipes] Generating recipe ideas from:', ingredientNames);
      
      const recipeIdeas = await llmService.generateMultipleRecipeIdeas(ingredientNames, 10);
      console.log('[Recipes] Generated recipe ideas:', recipeIdeas);
      
      if (recipeIdeas.length === 0) {
        Alert.alert('No Recipes', 'Could not generate recipes with your current ingredients.');
      } else {
        setGeneratedRecipes(recipeIdeas);
        setLastFridgeSnapshot(ingredientNames);
      }
    } catch (error) {
      console.error('[Recipes] Generation error:', error);
      Alert.alert('Error', 'Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectRecipe = async (recipeName: string) => {
    if (generatingRecipe) {
      console.log('[Recipes] Recipe generation already in progress, ignoring tap');
      return;
    }

    console.log('[Recipes] Recipe selected:', recipeName);
    
    setGeneratingRecipe(recipeName);
    try {
      const llmService = new LLMService();
      const ingredientNames = fridgeItems.map(item => item.name);
      
      console.log('[Recipes] Generating full recipe for:', recipeName, 'with ingredients:', ingredientNames);
      const recipe = await llmService.generateRecipeFromName(recipeName, ingredientNames);
      
      // Temporarily save to recipe store (will show as unsaved in detail view)
      await addRecipe(recipe);
      
      // Dismiss sheet
      sheetRef.current?.dismiss();
      
      // Navigate to recipe detail with fromGeneration flag
      router.push(`/recipe/${recipe.id}?fromGeneration=true`);
    } catch (error) {
      console.error('[Recipes] Recipe generation error:', error);
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    } finally {
      setGeneratingRecipe(null);
    }
  };

  const handleCloseSheet = () => {
    // Keep cached recipes for reuse, just dismiss the sheet
    setGeneratingRecipe(null);
  };

  const renderRightActions = () => (
    <View style={styles.swipeDeleteContainer}>
      <Body style={styles.swipeDeleteText}>Delete</Body>
    </View>
  );

  if (isLoading) {
    return (
      <Screen>
        <LoadingSpinner message="Loading your recipes..." />
      </Screen>
    );
  }

  const ingredientNames = fridgeItems.map(item => item.name);
  const fridgeChanged = JSON.stringify(lastFridgeSnapshot) !== JSON.stringify(ingredientNames);
  const hasCachedRecipes = generatedRecipes && generatedRecipes.length > 0 && !fridgeChanged;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <H1 style={styles.title}>Recipes</H1>
        <Caption style={styles.subtitle}>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
        </Caption>
      </View>

      {/* Search */}
      <TextField
        placeholder="Search recipes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        showClearButton={searchQuery.length > 0}
        containerStyle={styles.searchField}
      />

      {/* Generate Recipes Card - Show when fridge has items */}
      {fridgeItems.length > 0 && !searchQuery && (
        <Card style={styles.generateCard} variant="filled">
          <View style={styles.generateCardContent}>
            <View style={styles.generateCardText}>
              <Body style={styles.generateCardTitle}>Ready to Cook?</Body>
              <Caption>
                {hasCachedRecipes 
                  ? `View ${generatedRecipes.length} recipe ideas from your fridge`
                  : `Generate recipes from your ${fridgeItems.length} fridge items`
                }
              </Caption>
            </View>
          </View>
          <Button
            title={isGenerating ? 'Generating...' : hasCachedRecipes ? 'View Recipes' : 'Generate Recipes'}
            onPress={handleGenerateRecipes}
            variant="primary"
            size="small"
            loading={isGenerating}
            disabled={isGenerating}
          />
        </Card>
      )}

      {/* Recipes List or Empty State */}
      {filteredRecipes.length === 0 ? (
        <EmptyState
          iconName={searchQuery ? 'search' : 'book-open'}
          title={searchQuery ? 'No recipes found' : 'No recipes yet'}
          description={
            searchQuery
              ? 'Try a different search term'
              : fridgeItems.length > 0
              ? 'Generate recipes from your fridge ingredients'
              : 'Scan ingredients to create your first recipe'
          }
          actionLabel={searchQuery ? undefined : fridgeItems.length > 0 ? 'Generate Recipes' : 'Scan Ingredients'}
          onAction={searchQuery ? undefined : fridgeItems.length > 0 ? handleGenerateRecipes : () => router.push('/')}
        />
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={renderRightActions}
              onSwipeableOpen={() => {
                deleteRecipe(item.id);
              }}
            >
              <RecipeCard
                recipe={item}
                onPress={() => handleRecipePress(item.id)}
              />
            </Swipeable>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Recipe Ideas Sheet */}
      <SuggestionsSheet
        ref={sheetRef}
        recommendations={generatedRecipes ? {
          recommendations: [],
          possibleRecipes: generatedRecipes,
          summary: `${generatedRecipes.length} recipe ideas generated`,
          currentStrengths: [],
          gaps: [],
        } : null}
        onClose={handleCloseSheet}
        onShare={() => {}}
        onSelectRecipe={handleSelectRecipe}
        generatingRecipe={generatingRecipe}
        hideShoppingTab={true}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textMuted,
  },
  searchField: {
    marginBottom: SPACING.lg,
  },
  generateCard: {
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generateCardContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  generateCardText: {
    gap: SPACING.xs,
  },
  generateCardTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  swipeDeleteContainer: {
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    borderRadius: SPACING.md,
  },
  swipeDeleteText: {
    color: COLORS.primaryTextOn,
    fontWeight: '600',
  },
});
