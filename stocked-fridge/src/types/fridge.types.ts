export interface FridgeItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
  addedAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  imageUri?: string;
  notes?: string;
}

export type FridgeItemInput = Omit<FridgeItem, 'id' | 'addedAt'>;

export interface IngredientRecommendation {
  ingredient: string;
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  unlocksRecipes: string[];
}

export interface FridgeRecommendations {
  recommendations: IngredientRecommendation[];
  summary: string;
  currentStrengths: string[];
  gaps: string[];
  possibleRecipes: string[];
}
