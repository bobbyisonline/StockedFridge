/**
 * Culinary Rules and Validation
 * Prevents implausible, gross, or culturally incorrect ingredient combinations
 */

export type IngredientCategory = 
  | 'sweet-dessert'
  | 'savory-protein'
  | 'savory-vegetable'
  | 'condiment-savory'
  | 'condiment-sweet'
  | 'grain-neutral'
  | 'dairy-neutral'
  | 'pantry-staple'
  | 'spice-neutral'
  | 'fruit'
  | 'unknown';

export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

/**
 * Ingredient categorization map
 */
export const INGREDIENT_CATEGORIES: Record<string, IngredientCategory> = {
  // Sweet/Dessert
  'yogurt': 'sweet-dessert',
  'honey': 'sweet-dessert',
  'sugar': 'sweet-dessert',
  'chocolate': 'sweet-dessert',
  'granola': 'sweet-dessert',
  'maple syrup': 'sweet-dessert',
  'jam': 'sweet-dessert',
  'vanilla': 'sweet-dessert',
  'cinnamon': 'sweet-dessert',
  'nutella': 'sweet-dessert',
  'whipped cream': 'sweet-dessert',
  'ice cream': 'sweet-dessert',
  
  // Fruits
  'apple': 'fruit',
  'banana': 'fruit',
  'orange': 'fruit',
  'strawberry': 'fruit',
  'blueberry': 'fruit',
  'raspberry': 'fruit',
  'mango': 'fruit',
  'pineapple': 'fruit',
  'peach': 'fruit',
  'grape': 'fruit',
  'berry': 'fruit',
  'lemon': 'fruit',
  'lime': 'fruit',
  
  // Savory Proteins
  'chicken': 'savory-protein',
  'beef': 'savory-protein',
  'pork': 'savory-protein',
  'fish': 'savory-protein',
  'salmon': 'savory-protein',
  'tuna': 'savory-protein',
  'turkey': 'savory-protein',
  'bacon': 'savory-protein',
  'ham': 'savory-protein',
  'sausage': 'savory-protein',
  'egg': 'savory-protein',
  'tofu': 'savory-protein',
  
  // Savory Vegetables
  'onion': 'savory-vegetable',
  'garlic': 'savory-vegetable',
  'tomato': 'savory-vegetable',
  'potato': 'savory-vegetable',
  'carrot': 'savory-vegetable',
  'broccoli': 'savory-vegetable',
  'spinach': 'savory-vegetable',
  'lettuce': 'savory-vegetable',
  'cucumber': 'savory-vegetable',
  'bell pepper': 'savory-vegetable',
  'mushroom': 'savory-vegetable',
  'zucchini': 'savory-vegetable',
  'celery': 'savory-vegetable',
  'kale': 'savory-vegetable',
  
  // Savory Condiments (NEVER in desserts/sweet dishes)
  'ketchup': 'condiment-savory',
  'mustard': 'condiment-savory',
  'mayo': 'condiment-savory',
  'mayonnaise': 'condiment-savory',
  'hot sauce': 'condiment-savory',
  'soy sauce': 'condiment-savory',
  'worcestershire': 'condiment-savory',
  'bbq sauce': 'condiment-savory',
  'salsa': 'condiment-savory',
  'ranch': 'condiment-savory',
  'vinegar': 'condiment-savory',
  
  // Neutral Grains
  'bread': 'grain-neutral',
  'rice': 'grain-neutral',
  'pasta': 'grain-neutral',
  'tortilla': 'grain-neutral',
  'oats': 'grain-neutral',
  'quinoa': 'grain-neutral',
  'couscous': 'grain-neutral',
  'flour': 'grain-neutral',
  
  // Neutral Dairy
  'milk': 'dairy-neutral',
  'cheese': 'dairy-neutral',
  'cream': 'dairy-neutral',
  'butter': 'dairy-neutral',
  'sour cream': 'dairy-neutral',
  'cream cheese': 'dairy-neutral',
  'parmesan': 'dairy-neutral',
  'mozzarella': 'dairy-neutral',
  
  // Pantry Staples (can be assumed)
  'salt': 'pantry-staple',
  'pepper': 'pantry-staple',
  'black pepper': 'pantry-staple',
  'oil': 'pantry-staple',
  'olive oil': 'pantry-staple',
  'vegetable oil': 'pantry-staple',
  'water': 'pantry-staple',
  
  // Neutral Spices
  'cumin': 'spice-neutral',
  'paprika': 'spice-neutral',
  'oregano': 'spice-neutral',
  'basil': 'spice-neutral',
  'thyme': 'spice-neutral',
  'rosemary': 'spice-neutral',
  'chili powder': 'spice-neutral',
  'ginger': 'spice-neutral',
  'turmeric': 'spice-neutral',
};

/**
 * Get ingredient category with fuzzy matching
 */
export function categorizeIngredient(ingredient: string): IngredientCategory {
  const normalized = ingredient.toLowerCase().trim();
  
  // Exact match
  if (INGREDIENT_CATEGORIES[normalized]) {
    return INGREDIENT_CATEGORIES[normalized];
  }
  
  // Remove common plural suffix for better matching
  const singularized = normalized.replace(/ies$/, 'y').replace(/s$/, '');
  if (INGREDIENT_CATEGORIES[singularized]) {
    return INGREDIENT_CATEGORIES[singularized];
  }
  
  // Fuzzy match (contains)
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (normalized.includes(key) || key.includes(normalized) || singularized.includes(key) || key.includes(singularized)) {
      return category;
    }
  }
  
  return 'unknown';
}

/**
 * Incompatible category combinations
 */
const INCOMPATIBLE_COMBINATIONS: Array<[IngredientCategory[], IngredientCategory[]]> = [
  // Savory condiments NEVER in sweet dishes
  [['condiment-savory'], ['sweet-dessert']],
  [['condiment-savory'], ['fruit']],
  
  // Savory proteins RARELY in pure desserts (unless explicitly savory-sweet like bacon desserts)
  [['savory-protein'], ['sweet-dessert']],
  
  // Savory vegetables NOT in desserts
  [['savory-vegetable'], ['sweet-dessert']],
];

/**
 * Check if ingredient categories are compatible
 */
export function areCategoriesCompatible(categories: IngredientCategory[]): boolean {
  for (const [forbidden, incompatibleWith] of INCOMPATIBLE_COMBINATIONS) {
    const hasForbidden = categories.some(c => forbidden.includes(c));
    const hasIncompatible = categories.some(c => incompatibleWith.includes(c));
    
    if (hasForbidden && hasIncompatible) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate a recipe's ingredient compatibility
 */
export function validateRecipeIngredients(
  ingredients: Array<{ name: string }>,
  recipeCategory?: RecipeCategory
): { isValid: boolean; reason?: string } {
  const categories = ingredients
    .map(ing => categorizeIngredient(ing.name))
    .filter(cat => cat !== 'unknown' && cat !== 'pantry-staple');
  
  // Check for incompatible combinations
  if (!areCategoriesCompatible(categories)) {
    return {
      isValid: false,
      reason: 'Contains incompatible ingredient combinations (e.g., ketchup in dessert)',
    };
  }
  
  // Category-specific rules
  if (recipeCategory === 'dessert') {
    const hasSavoryCondiment = categories.includes('condiment-savory');
    const hasSavoryProtein = categories.includes('savory-protein');
    const hasSavoryVeg = categories.includes('savory-vegetable');
    
    if (hasSavoryCondiment) {
      return {
        isValid: false,
        reason: 'Dessert contains savory condiments (ketchup, mustard, etc.)',
      };
    }
    
    if (hasSavoryProtein || hasSavoryVeg) {
      return {
        isValid: false,
        reason: 'Dessert contains savory ingredients that don\'t belong',
      };
    }
  }
  
  if (recipeCategory === 'breakfast') {
    const hasSavoryCondiment = categories.includes('condiment-savory');
    
    // Breakfast can have savory elements BUT not random condiments in sweet dishes
    const hasSweet = categories.includes('sweet-dessert') || categories.includes('fruit');
    
    if (hasSavoryCondiment && hasSweet) {
      return {
        isValid: false,
        reason: 'Breakfast mixes sweet and savory condiments inappropriately',
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Check if a substitution makes culinary sense
 */
export function isValidSubstitution(original: string, substitute: string): boolean {
  const origCategory = categorizeIngredient(original);
  const subCategory = categorizeIngredient(substitute);
  
  // Same category is usually fine
  if (origCategory === subCategory) {
    return true;
  }
  
  // Some cross-category substitutions are OK
  const validCrossCategorySubs: Array<[IngredientCategory, IngredientCategory]> = [
    ['dairy-neutral', 'sweet-dessert'], // milk in desserts
    ['grain-neutral', 'sweet-dessert'], // oats in desserts
    ['spice-neutral', 'sweet-dessert'], // cinnamon, etc.
  ];
  
  for (const [cat1, cat2] of validCrossCategorySubs) {
    if (
      (origCategory === cat1 && subCategory === cat2) ||
      (origCategory === cat2 && subCategory === cat1)
    ) {
      return true;
    }
  }
  
  // Forbidden substitutions
  const forbiddenSubs = [
    { from: 'granola', to: 'bread' },
    { from: 'bread', to: 'granola' },
    { from: 'cereal', to: 'bread' },
  ];
  
  for (const { from, to } of forbiddenSubs) {
    if (
      original.toLowerCase().includes(from) && substitute.toLowerCase().includes(to)
    ) {
      return false;
    }
  }
  
  // Different categories should be carefully considered
  return origCategory === 'unknown' || subCategory === 'unknown';
}

/**
 * Get allowed pantry staples that can be assumed
 */
export const ALLOWED_PANTRY_STAPLES = [
  'salt',
  'pepper',
  'black pepper',
  'oil',
  'olive oil',
  'vegetable oil',
  'water',
  'butter', // common enough to assume
];

/**
 * Check if ingredient is a pantry staple that can be assumed
 */
export function isPantryStaple(ingredient: string): boolean {
  const normalized = ingredient.toLowerCase().trim();
  return ALLOWED_PANTRY_STAPLES.some(staple => 
    normalized.includes(staple) || staple.includes(normalized)
  );
}

/**
 * Build culinary rules for LLM prompt
 */
export function getCulinaryRulesPrompt(): string {
  return `
CRITICAL CULINARY RULES - DO NOT VIOLATE:

1. INGREDIENT CATEGORY COMPATIBILITY:
   - NEVER mix savory condiments (ketchup, mustard, mayo, hot sauce) with desserts or sweet dishes
   - NEVER put savory sauces in breakfast bowls, parfaits, or sweet items
   - Desserts must ONLY use sweet ingredients: fruits, yogurt, honey, chocolate, granola
   - Savory dishes can use proteins, vegetables, and savory condiments
   - If mixing would create a gross or implausible combination, SKIP THE RECIPE

2. RECIPE CATEGORY INTEGRITY:
   - Desserts: sweet ingredients only, no meat, no savory sauces
   - Breakfast: can be sweet OR savory, but not mixed inappropriately
   - Lunch/Dinner: savory focus, condiments appropriate for savory dishes
   - If category constraints can't be met with available ingredients, return fewer recipes

3. NO CREATIVE FILLER:
   - NEVER substitute bread for granola, cereal, or crumble toppings
   - NEVER use condiments as "flavor additions" where they don't belong
   - NEVER suggest milk + ketchup as a binding agent
   - Substitutions must be COMMON and EXPECTED by home cooks

4. PANTRY STAPLES:
   - You may assume: salt, pepper, oil, butter, water
   - EVERYTHING ELSE must be explicitly in the available ingredients list
   - Do not add ingredients not provided

5. QUALITY OVER QUANTITY:
   - If an ingredient substitution would make the dish taste wrong or violate cooking norms, DO NOT SUGGEST IT
   - Return fewer high-quality recipes rather than force bad combinations
   - When in doubt, skip the recipe

6. VALIDATION CHECK:
   - Before finalizing each recipe, ask: "Would a normal person eat this?"
   - If the answer is no, discard it and try something simpler
   - Common sense must prevail over creativity
`;
}
