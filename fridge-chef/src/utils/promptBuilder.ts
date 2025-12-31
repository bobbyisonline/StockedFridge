import { SYSTEM_PROMPTS } from '@/constants/prompts';

export type PromptType = 'recipe' | 'ingredients' | 'refinement';

export interface PromptOptions {
  customInstructions?: string;
  dietaryRestrictions?: string[];
  cuisinePreference?: string;
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
