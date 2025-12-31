/**
 * Ingredient Availability Utilities
 * 
 * Provides the source of truth for what ingredients are actually available
 * to the user, ensuring recipes only use items they have.
 */

import { useFridgeStore } from '@/store/fridgeStore';

/**
 * Get a normalized list of available ingredient names from the fridge
 * @returns Array of lowercase, trimmed ingredient names
 */
export function getAvailableIngredients(): string[] {
  const { items } = useFridgeStore.getState();
  
  return items
    .map(item => item.name.toLowerCase().trim())
    .filter(name => name.length > 0);
}

/**
 * Get available ingredients with option to include scan results
 * @param includeScannedItems - Detected items from current scan (not yet added to fridge)
 * @returns Array of lowercase, trimmed ingredient names
 */
export function getAvailableIngredientsWithScan(includeScannedItems?: string[]): string[] {
  const fridgeItems = getAvailableIngredients();
  
  if (!includeScannedItems || includeScannedItems.length === 0) {
    return fridgeItems;
  }
  
  // Normalize scanned items
  const normalizedScanned = includeScannedItems
    .map(item => item.toLowerCase().trim())
    .filter(name => name.length > 0);
  
  // Combine and deduplicate
  const combined = [...fridgeItems, ...normalizedScanned];
  return Array.from(new Set(combined));
}

/**
 * Check if a recipe only uses available ingredients
 * @param recipeIngredients - List of ingredient names from recipe
 * @param availableIngredients - List of ingredients user has
 * @returns Object with validation result and missing ingredients
 */
export function validateRecipeIngredients(
  recipeIngredients: string[],
  availableIngredients: string[]
): {
  isValid: boolean;
  missingIngredients: string[];
  invalidIngredients: string[];
} {
  const normalizedAvailable = availableIngredients.map(i => i.toLowerCase().trim());
  const normalizedRecipe = recipeIngredients.map(i => i.toLowerCase().trim());
  
  const missingIngredients: string[] = [];
  const invalidIngredients: string[] = [];
  
  normalizedRecipe.forEach((ingredient, index) => {
    if (!normalizedAvailable.includes(ingredient)) {
      missingIngredients.push(ingredient);
      invalidIngredients.push(recipeIngredients[index]); // Original casing
    }
  });
  
  return {
    isValid: missingIngredients.length === 0,
    missingIngredients,
    invalidIngredients,
  };
}

/**
 * Normalize ingredient name for comparison
 * Handles common variations (e.g., "chicken breast" vs "chicken breasts")
 */
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/s$/, '') // Remove trailing 's' for plurals
    .replace(/[^\w\s]/g, ''); // Remove special characters
}

/**
 * Check if recipe ingredient matches available ingredient (fuzzy)
 * @param recipeIngredient - Ingredient from recipe
 * @param availableIngredients - List of ingredients user has
 * @returns True if a match is found
 */
export function ingredientMatchesAvailable(
  recipeIngredient: string,
  availableIngredients: string[]
): boolean {
  const normalizedRecipe = normalizeIngredientName(recipeIngredient);
  
  return availableIngredients.some(available => {
    const normalizedAvailable = normalizeIngredientName(available);
    
    // Exact match
    if (normalizedRecipe === normalizedAvailable) return true;
    
    // One contains the other (e.g., "tomato" matches "cherry tomatoes")
    if (normalizedRecipe.includes(normalizedAvailable) || 
        normalizedAvailable.includes(normalizedRecipe)) {
      return true;
    }
    
    return false;
  });
}
