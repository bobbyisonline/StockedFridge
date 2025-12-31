import { Recipe, Ingredient, RecipeStep } from '@/types';
import { VALIDATION } from '@/constants/config';

/**
 * Validates a recipe object structure
 */
export function validateRecipe(recipe: any): recipe is Recipe {
  if (!recipe || typeof recipe !== 'object') return false;

  // Required fields
  if (!recipe.id || typeof recipe.id !== 'string') return false;
  if (!recipe.title || typeof recipe.title !== 'string') return false;
  if (!Array.isArray(recipe.ingredients)) return false;
  if (!Array.isArray(recipe.steps)) return false;
  if (!Array.isArray(recipe.tags)) return false;

  // Validate ingredients count
  if (
    recipe.ingredients.length < VALIDATION.MIN_INGREDIENTS ||
    recipe.ingredients.length > VALIDATION.MAX_INGREDIENTS
  ) {
    return false;
  }

  // Validate steps count
  if (
    recipe.steps.length < VALIDATION.MIN_STEPS ||
    recipe.steps.length > VALIDATION.MAX_STEPS
  ) {
    return false;
  }

  // Validate each ingredient
  if (!recipe.ingredients.every(validateIngredient)) return false;

  // Validate each step
  if (!recipe.steps.every(validateRecipeStep)) return false;

  return true;
}

/**
 * Validates an ingredient object
 */
export function validateIngredient(ingredient: any): ingredient is Ingredient {
  return (
    ingredient &&
    typeof ingredient.id === 'string' &&
    typeof ingredient.name === 'string' &&
    typeof ingredient.quantity === 'number' &&
    typeof ingredient.unit === 'string' &&
    ingredient.name.length > 0
  );
}

/**
 * Validates a recipe step object
 */
export function validateRecipeStep(step: any): step is RecipeStep {
  return (
    step &&
    typeof step.stepNumber === 'number' &&
    typeof step.instruction === 'string' &&
    step.instruction.length > 0
  );
}

/**
 * Sanitizes LLM JSON response (removes markdown code blocks if present)
 */
export function sanitizeJSONResponse(response: string): string {
  // Remove markdown code blocks
  let cleaned = response.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  return cleaned.trim();
}

/**
 * Checks if a string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
