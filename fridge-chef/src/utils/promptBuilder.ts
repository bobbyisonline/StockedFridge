import { SYSTEM_PROMPTS } from '@/constants/prompts';
import { getCulinaryRulesPrompt } from './culinaryRules';

export type PromptType = 'recipe' | 'ingredients' | 'refinement' | 'recommendations';

export interface PromptOptions {
  customInstructions?: string;
  dietaryRestrictions?: string[];
  cuisinePreference?: string;
  availableIngredients?: string[]; // List of ingredients user actually has
}

/**
 * Builds the appropriate system prompt based on the operation type
 */
export function buildSystemPrompt(
  type: PromptType,
  options?: PromptOptions
): string {
  let basePrompt = '';

  switch (type) {
    case 'recipe':
      basePrompt = SYSTEM_PROMPTS.RECIPE_GENERATION;
      break;
    case 'ingredients':
      basePrompt = SYSTEM_PROMPTS.INGREDIENT_DETECTION;
      break;
    case 'refinement':
      basePrompt = SYSTEM_PROMPTS.RECIPE_REFINEMENT;
      break;
    case 'recommendations':
      basePrompt = SYSTEM_PROMPTS.INGREDIENT_RECOMMENDATIONS;
      break;
  }

  // Add available ingredients constraint for recipe generation
  if (type === 'recipe' && options?.availableIngredients && options.availableIngredients.length > 0) {
    basePrompt += `\n\n**AVAILABLE INGREDIENTS (STRICT - USE ONLY THESE):**\n${options.availableIngredients.join(', ')}`;
    
    // Add culinary rules for recipe generation
    basePrompt += `\n\n${getCulinaryRulesPrompt()}`;
  }

  // Add current fridge inventory for recommendations
  if (type === 'recommendations' && options?.availableIngredients && options.availableIngredients.length > 0) {
    basePrompt += `\n\n**CURRENT FRIDGE INVENTORY (DO NOT RECOMMEND THESE):**\n${options.availableIngredients.join(', ')}`;
  }

  // Add custom instructions if provided
  if (options?.customInstructions) {
    basePrompt += `\n\nADDITIONAL INSTRUCTIONS: ${options.customInstructions}`;
  }

  // Add dietary restrictions
  if (options?.dietaryRestrictions && options.dietaryRestrictions.length > 0) {
    basePrompt += `\n\nDIETARY RESTRICTIONS: ${options.dietaryRestrictions.join(', ')}`;
  }

  // Add cuisine preference
  if (options?.cuisinePreference) {
    basePrompt += `\n\nCUISINE PREFERENCE: ${options.cuisinePreference}`;
  }

  return basePrompt;
}

/**
 * Builds a user message for recipe refinement
 */
export function buildRefinementMessage(
  recipeTitle: string,
  instruction: string
): string {
  return `Modify the recipe "${recipeTitle}" with this instruction: ${instruction}`;
}
