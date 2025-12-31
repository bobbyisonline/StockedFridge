import { Recipe } from './recipe.types';

export type ScanStatus = 
  | 'idle'
  | 'capturing'
  | 'processing'
  | 'analyzing'
  | 'streaming'
  | 'success'
  | 'error';

export interface ScanSession {
  id: string;
  status: ScanStatus;
  imageUri: string | null;
  imageBase64?: string;       // Compressed version for API
  detectedIngredients: string[]; // Raw LLM output
  generatedRecipe: Recipe | null;
  error: ScanError | null;
  startedAt: Date;
  completedAt?: Date;
}

export interface ScanError {
  code: 'NO_FOOD_DETECTED' | 'API_ERROR' | 'PERMISSION_DENIED' | 'IMAGE_TOO_LARGE' | 'NETWORK_ERROR';
  message: string;
  recoverable: boolean;
}
