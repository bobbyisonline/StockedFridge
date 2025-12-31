import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useRecipeStore } from '@/store/recipeStore';
import { RecipeCard } from '@/components/RecipeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, SPACING, LAYOUT } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { TextField } from '@/components/ui/TextField';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RecipesScreen() {
  const router = useRouter();
  const { recipes, isLoading, searchRecipes, deleteRecipe } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = searchQuery
    ? searchRecipes(searchQuery)
    : recipes;

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
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
        leftIcon={<Body>🔍</Body>}
        containerStyle={styles.searchField}
      />

      {/* Recipes List or Empty State */}
      {filteredRecipes.length === 0 ? (
        <EmptyState
          icon={searchQuery ? '🔍' : '📝'}
          title={searchQuery ? 'No recipes found' : 'No recipes yet'}
          message={
            searchQuery
              ? 'Try a different search term'
              : 'Scan ingredients to create your first recipe'
          }
          actionLabel={searchQuery ? undefined : 'Scan Ingredients'}
          onAction={searchQuery ? undefined : () => router.push('/')}
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
