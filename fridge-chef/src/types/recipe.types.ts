export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string; // 'g', 'ml', 'cup', 'tbsp', 'piece', etc.
  category?: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
  isOptional?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  duration?: number; // in minutes
  temperature?: {
    value: number;
    unit: 'celsius' | 'fahrenheit';
  };
}

export interface Macros {
  calories: number;
  protein: number;   // grams
  carbs: number;     // grams
  fat: number;       // grams
  fiber?: number;    // grams
}

export type RecipeTag = 
  | 'Vegan' 
  | 'Vegetarian' 
  | 'Gluten-Free' 
  | 'Dairy-Free'
  | 'Quick' 
  | 'Healthy' 
  | 'Budget-Friendly'
  | 'Comfort Food'
  | 'Dinner'
  | 'Lunch'
  | 'Breakfast';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  macros?: Macros;
  tags: RecipeTag[];
  servings: number;
  prepTime: number;    // minutes
  cookTime: number;    // minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUri?: string;   // Original captured image
  createdAt: Date;
  updatedAt: Date;
}
