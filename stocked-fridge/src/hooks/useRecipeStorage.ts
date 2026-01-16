import { useEffect, useCallback } from 'react';
import { useRecipeStore } from '@/store/recipeStore';
import { Recipe } from '@/types';

interface UseRecipeStorageReturn {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  loadRecipes: () => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
}

export function useRecipeStorage(): UseRecipeStorageReturn {
  const {
    recipes,
    isLoading,
    error,
    loadRecipes: load,
    addRecipe,
    deleteRecipe: remove,
    getRecipeById: getById,
  } = useRecipeStore();

  // Load recipes on mount
  useEffect(() => {
    load();
  }, [load]);

  const saveRecipe = useCallback(
    async (recipe: Recipe) => {
      await addRecipe(recipe);
    },
    [addRecipe]
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove]
  );

  const getRecipeById = useCallback(
    (id: string) => {
      return getById(id);
    },
    [getById]
  );

  return {
    recipes,
    isLoading,
    error,
    loadRecipes: load,
    saveRecipe,
    deleteRecipe,
    getRecipeById,
  };
}
