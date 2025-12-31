import { LLMRequest, LLMResponse, LLMStreamChunk, Recipe, ScanError } from '@/types';
import { API_CONFIG } from '@/constants/config';
import { buildSystemPrompt, PromptOptions } from '@/utils/promptBuilder';
import { sanitizeJSONResponse, validateRecipe } from '@/utils/validators';

export interface ILLMService {
  generateRecipeFromImage(request: LLMRequest): Promise<LLMResponse>;
  generateRecipeStreamAsync(
    request: LLMRequest,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<LLMResponse>;
  detectIngredients(imageBase64: string): Promise<string[]>;
  refineRecipe(recipeId: string, instruction: string): Promise<Recipe>;
}

export class LLMServiceError extends Error {
  constructor(
    message: string,
    public code: ScanError['code'],
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'LLMServiceError';
  }
}

export class LLMService implements ILLMService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config?: { apiKey?: string; baseURL?: string; model?: string }) {
    this.apiKey = config?.apiKey || API_CONFIG.OPENAI_API_KEY;
    this.baseURL = config?.baseURL || API_CONFIG.OPENAI_BASE_URL;
    this.model = config?.model || API_CONFIG.OPENAI_MODEL;

    if (!this.apiKey) {
      console.warn('OpenAI API key not configured');
    }
  }

  /**
   * Generates a complete recipe from an image
   */
  async generateRecipeFromImage(request: LLMRequest): Promise<LLMResponse> {
    try {
      const systemPrompt = buildSystemPrompt('recipe');

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: request.prompt || 'Analyze this image and generate a recipe.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${request.mimeType};base64,${request.imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: request.maxTokens || API_CONFIG.MAX_TOKENS,
          temperature: request.temperature || API_CONFIG.TEMPERATURE,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LLMServiceError(
          errorData.error?.message || 'API request failed',
          'API_ERROR',
          true
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new LLMServiceError('No response from API', 'API_ERROR', true);
      }

      return this.parseRecipeResponse(content);
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(
        `Failed to generate recipe: ${error}`,
        'API_ERROR',
        true
      );
    }
  }

  /**
   * Generates a recipe with streaming support
   */
  async generateRecipeStreamAsync(
    request: LLMRequest,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<LLMResponse> {
    try {
      const systemPrompt = buildSystemPrompt('recipe');

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: request.prompt || 'Analyze this image and generate a recipe.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${request.mimeType};base64,${request.imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: request.maxTokens || API_CONFIG.MAX_TOKENS,
          temperature: request.temperature || API_CONFIG.TEMPERATURE,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new LLMServiceError('API request failed', 'API_ERROR', true);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new LLMServiceError('No response stream', 'API_ERROR', false);
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
                
                onChunk({
                  type: 'metadata',
                  content,
                  isComplete: false,
                });
              }
            } catch (e) {
              // Skip malformed chunks
            }
          }
        }
      }

      onChunk({
        type: 'metadata',
        content: '',
        isComplete: true,
      });

      return this.parseRecipeResponse(fullContent);
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(
        `Failed to generate recipe: ${error}`,
        'API_ERROR',
        true
      );
    }
  }

  /**
   * Detects ingredients in an image (faster, cheaper pre-check)
   */
  async detectIngredients(imageBase64: string): Promise<string[]> {
    try {
      const systemPrompt = buildSystemPrompt('ingredients');

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'List all visible food ingredients in this image.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new LLMServiceError('API request failed', 'API_ERROR', true);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        return [];
      }

      const sanitized = sanitizeJSONResponse(content);
      const ingredients = JSON.parse(sanitized);

      return Array.isArray(ingredients) ? ingredients : [];
    } catch (error) {
      console.error('Ingredient detection failed:', error);
      return [];
    }
  }

  /**
   * Refines an existing recipe based on user instructions
   */
  async refineRecipe(recipeId: string, instruction: string): Promise<Recipe> {
    throw new Error('Recipe refinement not yet implemented');
  }

  /**
   * Parses and validates the LLM response
   */
  private parseRecipeResponse(content: string): LLMResponse {
    try {
      const sanitized = sanitizeJSONResponse(content);
      const parsed = JSON.parse(sanitized);

      // Check for error response
      if (parsed.error === 'NO_FOOD_DETECTED') {
        throw new LLMServiceError(
          parsed.message || 'No food detected in image',
          'NO_FOOD_DETECTED',
          true
        );
      }

      // Generate ID and timestamps
      const recipe: Recipe = {
        ...parsed,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate the recipe structure
      if (!validateRecipe(recipe)) {
        throw new LLMServiceError(
          'Invalid recipe structure from API',
          'API_ERROR',
          false
        );
      }

      return {
        recipe,
        confidence: parsed.confidence || 0.8,
        detectedItems: parsed.detectedItems || [],
        warnings: parsed.warnings,
      };
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(
        'Failed to parse recipe response',
        'API_ERROR',
        false
      );
    }
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}