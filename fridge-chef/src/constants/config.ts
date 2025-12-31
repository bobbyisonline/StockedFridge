// Environment configuration
export const API_CONFIG = {
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  OPENAI_MODEL: 'gpt-4o', // GPT-4 with vision capabilities
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
};

export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
  MAX_SIZE_MB: 5,
  COMPRESSION_FORMAT: 'jpeg' as const,
};

export const STORAGE_KEYS = {
  RECIPES: '@fridge_chef:recipes',
  SETTINGS: '@fridge_chef:settings',
  SCAN_HISTORY: '@fridge_chef:scan_history',
};

export const VALIDATION = {
  MIN_INGREDIENTS: 1,
  MAX_INGREDIENTS: 50,
  MIN_STEPS: 1,
  MAX_STEPS: 30,
};
