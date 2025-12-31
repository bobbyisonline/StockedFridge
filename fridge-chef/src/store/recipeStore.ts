import { create } from 'zustand';
import { Recipe } from '@/types';
import { StorageService } from '@/services/StorageService';

interface RecipeState {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  searchRecipes: (query: string) => Recipe[];
  filterByTags: (tags: string[]) => Recipe[];
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  error: null,

  loadRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const recipes = await StorageService.getAllRecipes();
      set({ recipes, isLoading: false });
    } catch (error) {
      set({ error: `Failed to load recipes: ${error}`, isLoading: false });
    }
  },

  addRecipe: async (recipe: Recipe) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.saveRecipe(recipe);
      set((state) => ({
        recipes: [...state.recipes, recipe],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Failed to add recipe: ${error}`, isLoading: false });
    }
  },

  updateRecipe: async (recipe: Recipe) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRecipe = { ...recipe, updatedAt: new Date() };
      await StorageService.saveRecipe(updatedRecipe);
      
      set((state) => ({
        recipes: state.recipes.map((r) =>
          r.id === updatedRecipe.id ? updatedRecipe : r
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Failed to update recipe: ${error}`, isLoading: false });
    }
  },

  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.deleteRecipe(id);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Failed to delete recipe: ${error}`, isLoading: false });
    }
  },

  getRecipeById: (id: string) => {
    return get().recipes.find((r) => r.id === id);
  },

  searchRecipes: (query: string) => {
    const lowerQuery = query.toLowerCase();
    return get().recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.description?.toLowerCase().includes(lowerQuery) ||
        recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(lowerQuery)
        )
    );
  },

  filterByTags: (tags: string[]) => {
    if (tags.length === 0) return get().recipes;
    
    return get().recipes.filter((recipe) =>
      tags.every((tag) => recipe.tags.includes(tag as any))
    );
  },
}));
