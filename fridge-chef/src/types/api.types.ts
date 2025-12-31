import { Recipe } from './recipe.types';

export interface LLMRequest {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png';
  prompt?: string;             // Optional custom prompt
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface LLMResponse {
  recipe: Recipe;
  confidence: number;          // 0-1 score
  detectedItems: string[];     // What the AI "saw"
  warnings?: string[];         // e.g., "Some ingredients unclear"
}

export interface LLMStreamChunk {
  type: 'ingredients' | 'steps' | 'metadata';
  content: string;
  isComplete: boolean;
}
