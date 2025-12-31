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
  private provider: 'openai' | 'gemini';
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config?: { provider?: 'openai' | 'gemini'; apiKey?: string; baseURL?: string; model?: string }) {
    this.provider = config?.provider || API_CONFIG.PROVIDER;
    
    if (this.provider === 'gemini') {
      this.apiKey = config?.apiKey || API_CONFIG.GEMINI_API_KEY;
      this.baseURL = config?.baseURL || API_CONFIG.GEMINI_BASE_URL;
      this.model = config?.model || API_CONFIG.GEMINI_MODEL;
    } else {
      this.apiKey = config?.apiKey || API_CONFIG.OPENAI_API_KEY;
      this.baseURL = config?.baseURL || API_CONFIG.OPENAI_BASE_URL;
      this.model = config?.model || API_CONFIG.OPENAI_MODEL;
    }

    if (!this.apiKey) {
      console.warn(`${this.provider} API key not configured`);
    }
  }

  /**
   * Generates a complete recipe from an image
   */
  async generateRecipeFromImage(request: LLMRequest): Promise<LLMResponse> {
    if (this.provider === 'gemini') {
      return this.generateRecipeFromImageGemini(request);
    }
    return this.generateRecipeFromImageOpenAI(request);
  }
  /**
   * Generates recipe using Gemini API
   */
  private async generateRecipeFromImageGemini(request: LLMRequest): Promise<LLMResponse> {
    try {
      const systemPrompt = buildSystemPrompt('recipe');
      const userPrompt = request.prompt || 'Analyze this image and generate a recipe.';

      const response = await fetch(
        `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: `${systemPrompt}\n\n${userPrompt}` },
                {
                  inline_data: {
                    mime_type: request.mimeType || 'image/jpeg',
                    data: request.imageBase64,
                  },
                },
              ],
            }],
            generationConfig: {
              temperature: request.temperature || API_CONFIG.TEMPERATURE,
              maxOutputTokens: request.maxTokens || API_CONFIG.MAX_TOKENS,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LLMServiceError(
          errorData.error?.message || 'Gemini API request failed',
          'API_ERROR',
          true
        );
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new LLMServiceError('No response from Gemini API', 'API_ERROR', true);
      }

      return this.parseRecipeResponse(content);
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(
        `Failed to generate recipe with Gemini: ${error}`,
        'API_ERROR',
        true
      );
    }
  }

  /**
   * Generates recipe using OpenAI API
   */
  private async generateRecipeFromImageOpenAI(request: LLMRequest): Promise<LLMResponse> {
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
    // Gemini streaming has different API, fall back to non-streaming for now
    if (this.provider === 'gemini') {
      const result = await this.generateRecipeFromImageGemini(request);
      onChunk({ type: 'metadata', content: 'Generation complete', isComplete: true });
      return result;
    }
    
    return this.generateRecipeStreamOpenAI(request, onChunk);
  }

  /**
   * OpenAI streaming implementation
   */
  private async generateRecipeStreamOpenAI(
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
   * Gets ingredient recommendations based on current fridge contents
   */
  async getIngredientRecommendations(currentIngredients: string[]): Promise<any> {
    try {
      const systemPrompt = buildSystemPrompt('recommendations');
      const userPrompt = `Current fridge inventory:\n${currentIngredients.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nProvide recommendations for complementary ingredients to purchase.`;

      if (this.provider === 'gemini') {
        const response = await fetch(
          `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              }],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new LLMServiceError(
            errorData.error?.message || 'Failed to get recommendations',
            'API_ERROR',
            true
          );
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
          throw new LLMServiceError('No response from API', 'API_ERROR', true);
        }

        const sanitized = sanitizeJSONResponse(content);
        return JSON.parse(sanitized);
      } else {
        // OpenAI implementation
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 2048,
            temperature: 0.5,
          }),
        });

        if (!response.ok) {
          throw new LLMServiceError('Failed to get recommendations', 'API_ERROR', true);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new LLMServiceError('No response from API', 'API_ERROR', true);
        }

        const sanitized = sanitizeJSONResponse(content);
        return JSON.parse(sanitized);
      }
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(
        `Failed to get recommendations: ${error}`,
        'API_ERROR',
        true
      );
    }
  }

  /**
   * Parses and validates the LLM response
   */
  private parseRecipeResponse(content: string): LLMResponse {
    try {
      console.log('Raw LLM response length:', content.length);
      console.log('Raw LLM response:', content);
      
      const sanitized = sanitizeJSONResponse(content);
      console.log('Sanitized response length:', sanitized.length);
      console.log('Sanitized response:', sanitized);
      
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
        console.error('Recipe validation failed:', recipe);
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
      console.error('Parse error:', error, '\nFull content length:', content.length, '\nFull content:', content);
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