import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/types';
import { FridgeItem } from '@/types/fridge.types';
import { STORAGE_KEYS } from '@/constants/config';

export interface UserSettings {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  servingsDefault: number;
  notificationsEnabled: boolean;
}

export class StorageService {
  /**
   * Saves a recipe to local storage
   */
  static async saveRecipe(recipe: Recipe): Promise<void> {
    try {
      const recipes = await this.getAllRecipes();
      const existingIndex = recipes.findIndex(r => r.id === recipe.id);

      if (existingIndex >= 0) {
        recipes[existingIndex] = recipe;
      } else {
        recipes.push(recipe);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (error) {
      throw new Error(`Failed to save recipe: ${error}`);
    }
  }

  /**
   * Gets all saved recipes
   */
  static async getAllRecipes(): Promise<Recipe[]> {
    try {
      const recipesJson = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!recipesJson) return [];

      const recipes = JSON.parse(recipesJson);
      // Convert date strings back to Date objects
      return recipes.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load recipes:', error);
      return [];
    }
  }

  /**
   * Gets a single recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe | null> {
    const recipes = await this.getAllRecipes();
    return recipes.find(r => r.id === id) || null;
  }

  /**
   * Deletes a recipe
   */
  static async deleteRecipe(id: string): Promise<void> {
    try {
      const recipes = await this.getAllRecipes();
      const filtered = recipes.filter(r => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filtered));
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${error}`);
    }
  }

  /**
   * Saves user settings
   */
  static async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  /**
   * Gets user settings
   */
  static async getSettings(): Promise<UserSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!settingsJson) {
        return {
          dietaryRestrictions: [],
          preferredCuisines: [],
          servingsDefault: 2,
          notificationsEnabled: true,
        };
      }
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {
        dietaryRestrictions: [],
        preferredCuisines: [],
        servingsDefault: 2,
        notificationsEnabled: true,
      };
    }
  }

  /**
   * Gets fridge items
   */
  static async getFridgeItems(): Promise<FridgeItem[]> {
    try {
      const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.FRIDGE_ITEMS);
      if (!itemsJson) return [];

      const items = JSON.parse(itemsJson);
      return items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
        lastUsedAt: item.lastUsedAt ? new Date(item.lastUsedAt) : undefined,
        expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load fridge items:', error);
      return [];
    }
  }

  /**
   * Saves fridge items
   */
  static async saveFridgeItems(items: FridgeItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FRIDGE_ITEMS, JSON.stringify(items));
    } catch (error) {
      throw new Error(`Failed to save fridge items: ${error}`);
    }
  }

  /**
   * Clears all data
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.RECIPES,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.SCAN_HISTORY,
        STORAGE_KEYS.FRIDGE_ITEMS,
      ]);
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }
}
