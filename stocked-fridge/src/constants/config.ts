// Environment configuration
export const API_CONFIG = {
  // LLM Provider: 'openai' or 'gemini'
  PROVIDER: (process.env.EXPO_PUBLIC_LLM_PROVIDER || 'gemini') as 'openai' | 'gemini',
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  OPENAI_MODEL: 'gpt-4o', // GPT-4 with vision capabilities
  
  // Gemini Configuration
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_MODEL: 'models/gemini-2.5-flash-lite', // Fastest free model
  
  MAX_TOKENS: 3072,
  TEMPERATURE: 0.3,
};

export const IMAGE_CONFIG = {
  MAX_WIDTH: 768,
  MAX_HEIGHT: 768,
  QUALITY: 0.7,
  MAX_SIZE_MB: 5,
  COMPRESSION_FORMAT: 'jpeg' as const,
};

export const STORAGE_KEYS = {
  RECIPES: '@fridge_chef:recipes',
  SETTINGS: '@fridge_chef:settings',
  SCAN_HISTORY: '@fridge_chef:scan_history',
  FRIDGE_ITEMS: '@fridge_chef:fridge_items',
};

export const VALIDATION = {
  MIN_INGREDIENTS: 1,
  MAX_INGREDIENTS: 50,
  MIN_STEPS: 1,
  MAX_STEPS: 30,
};
