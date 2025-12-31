import { LLMRequest, LLMResponse, LLMStreamChunk, Recipe, ScanError } from '@/types';
import { API_CONFIG } from '@/constants/config';
import { buildSystemPrompt, PromptOptions } from '@/utils/promptBuilder';
import { sanitizeJSONResponse, validateRecipe } from '@/utils/validators';
import { validateRecipeIngredients, getCulinaryRulesPrompt, RecipeCategory } from '@/utils/culinaryRules';

export interface ILLMService {
  generateRecipeFromImage(request: LLMRequest, availableIngredients?: string[]): Promise<LLMResponse>;
  generateRecipeStreamAsync(
    request: LLMRequest,
    onChunk: (chunk: LLMStreamChunk) => void,
    availableIngredients?: string[]
  ): Promise<LLMResponse>;
  detectIngredients(imageBase64: string | string[]): Promise<string[]>;
  refineRecipe(recipeId: string, instruction: string): Promise<Recipe>;
  generateRecipeFromName(recipeName: string, availableIngredients: string[]): Promise<Recipe>;
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
    this.apiKey = config?.apiKey || API_CONFIG.GEMINI_API_KEY;
    this.baseURL = config?.baseURL || API_CONFIG.GEMINI_BASE_URL;
    this.model = config?.model || API_CONFIG.GEMINI_MODEL;

    if (!this.apiKey) {
      console.warn('Gemini API key not configured');
    }
  }

  /**
   * Generates a complete recipe from an image
   */
  async generateRecipeFromImage(request: LLMRequest, availableIngredients?: string[]): Promise<LLMResponse> {
    try {
      const systemPrompt = buildSystemPrompt('recipe', { availableIngredients });
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
   * Generates a recipe with streaming support
   * Note: Gemini streaming uses different API, so we fall back to non-streaming
   */
  async generateRecipeStreamAsync(
    request: LLMRequest,
    onChunk: (chunk: LLMStreamChunk) => void,
    availableIngredients?: string[]
  ): Promise<LLMResponse> {
    const result = await this.generateRecipeFromImage(request, availableIngredients);
    onChunk({ type: 'metadata', content: 'Generation complete', isComplete: true });
    return result;
  }

  /**
   * Parses the LLM response and extracts the recipe
   */
  private parseRecipeResponse(content: string): LLMResponse {
    try {
      console.log('[LLM] Raw response preview:', content.substring(0, 500));

      const sanitized = sanitizeJSONResponse(content);
      const parsed = JSON.parse(sanitized);

      console.log('[LLM] Parsed response:', {
        hasTitle: !!parsed.title,
        hasIngredients: !!parsed.ingredients,
        ingredientsCount: parsed.ingredients?.length,
        hasSteps: !!parsed.steps,
        stepsCount: parsed.steps?.length,
      });

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

      if (!validateRecipe(recipe)) {
        throw new LLMServiceError('Invalid recipe structure', 'API_ERROR', false);
      }

      return {
        recipe,
        confidence: parsed.confidence || 0.8,
        detectedItems: parsed.detectedItems || [],
        warnings: parsed.warnings,
      };
    } catch (error) {
      console.error('[LLM] Failed to parse response:', error);
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError('Failed to parse recipe response', 'API_ERROR', false);
    }
  }

  /**
   * Detects ingredients from one or more images
   */
  async detectIngredients(imageBase64: string | string[]): Promise<string[]> {
    try {
      const images = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];
      const systemPrompt = buildSystemPrompt('ingredients');

      const parts: any[] = [
        { text: `${systemPrompt}\n\nList all visible food ingredients in these ${images.length} image(s). Return a JSON array of ingredient names.` },
      ];

      // Add all images to the parts array
      images.forEach((base64) => {
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64,
          },
        });
      });

      const response = await fetch(
        `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new LLMServiceError('API request failed', 'API_ERROR', true);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

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
   * Detect recipe category from tags
   */
  private detectRecipeCategory(recipe: Recipe): RecipeCategory | undefined {
    const tags = recipe.tags?.map(t => t.toLowerCase()) || [];
    
    if (tags.includes('breakfast')) return 'breakfast';
    if (tags.includes('lunch')) return 'lunch';
    if (tags.includes('dinner')) return 'dinner';
    if (tags.includes('dessert')) return 'dessert';
    if (tags.includes('snack')) return 'snack';
    
    // Fallback to detecting from title
    const title = recipe.title.toLowerCase();
    if (title.includes('breakfast') || title.includes('pancake') || title.includes('waffle')) return 'breakfast';
    if (title.includes('dessert') || title.includes('cake') || title.includes('cookie') || title.includes('parfait')) return 'dessert';
    
    return undefined;
  }

  /**
   * Generates a full recipe from a recipe name and available ingredients
   */
  async generateRecipeFromName(recipeName: string, availableIngredients: string[]): Promise<Recipe> {
    try {
      const prompt = buildSystemPrompt('recipe', { availableIngredients }) + `

Generate a complete recipe for: "${recipeName}"

The recipe MUST use ONLY ingredients from the available ingredients list provided above.

Return ONLY a JSON object matching this exact structure:
{
  "title": "${recipeName}",
  "description": "Brief description (1-2 sentences)",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [
    {
      "id": "ing_1",
      "name": "ingredient name",
      "quantity": 2,
      "unit": "cups",
      "category": "vegetable",
      "isOptional": false
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "detailed instruction",
      "duration": 5
    }
  ],
  "macros": {
    "calories": 350,
    "protein": 15,
    "carbs": 45,
    "fat": 10
  },
  "tags": ["Quick", "Dinner"],
  "detectedItems": []
}

Use appropriate categories: "protein", "vegetable", "grain", "dairy", "spice", "other"
Use appropriate tags from: "Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Quick", "Healthy", "Budget-Friendly", "Comfort Food", "Dinner", "Lunch", "Breakfast"
Difficulty must be: "Easy", "Medium", or "Hard"
Generate at least 3-5 ingredients and 3-8 steps.`;

      const response = await fetch(
        `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }],
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new LLMServiceError('Failed to generate recipe', 'API_ERROR', true);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new LLMServiceError('No response from API', 'API_ERROR', true);
      }

      console.log('[LLM] Raw Gemini response for recipe name:', content.substring(0, 500));

      const sanitized = sanitizeJSONResponse(content);
      const parsed = JSON.parse(sanitized);

      console.log('[LLM] Parsed recipe from name:', JSON.stringify(parsed, null, 2));

      // Generate ID and timestamps
      const recipe: Recipe = {
        ...parsed,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('[LLM] Recipe before validation:', {
        title: recipe.title,
        ingredientsCount: recipe.ingredients?.length,
        stepsCount: recipe.steps?.length,
        tagsCount: recipe.tags?.length
      });

      if (!validateRecipe(recipe)) {
        console.error('[LLM] Recipe validation failed. Full recipe:', JSON.stringify(recipe, null, 2));
        throw new LLMServiceError('Invalid recipe structure - check console for details', 'API_ERROR', false);
      }

      // Culinary validation
      const culinaryValidation = validateRecipeIngredients(recipe.ingredients, this.detectRecipeCategory(recipe));
      if (!culinaryValidation.isValid) {
        console.error('[LLM] Culinary validation failed:', culinaryValidation.reason);
        console.error('[LLM] Recipe:', JSON.stringify(recipe, null, 2));
        throw new LLMServiceError(
          `Recipe rejected: ${culinaryValidation.reason}. Try regenerating.`,
          'API_ERROR',
          true
        );
      }

      console.log('[LLM] Recipe validated successfully:', recipe.title);
      return recipe;
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
   * Gets ingredient recommendations
   */
  async getIngredientRecommendations(currentIngredients: string[]): Promise<any> {
    try {
      const systemPrompt = buildSystemPrompt('recommendations');
      const userPrompt = `Current fridge inventory:\n${currentIngredients.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nProvide recommendations for complementary ingredients to purchase.`;

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
   * Generates multiple recipe ideas (names only) based on available ingredients
   */
  async generateMultipleRecipeIdeas(availableIngredients: string[], count: number = 10): Promise<string[]> {
    try {
      const prompt = `${getCulinaryRulesPrompt()}

Based on these available ingredients:
${availableIngredients.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Generate exactly ${count} diverse recipe ideas that can be made with ONLY these ingredients. Each recipe should:
- Use at least 3 of the available ingredients
- Be realistic and practical
- Have a clear, appetizing name
- Represent different cuisines and meal types
- Follow ALL culinary rules above (no gross combinations!)

Return ONLY a JSON array of recipe name strings, nothing else.
Example format: ["Tomato Basil Pasta", "Chicken Stir Fry", "Greek Salad"]`;

      const response = await fetch(
        `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }],
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new LLMServiceError('Failed to generate recipe ideas', 'API_ERROR', true);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new LLMServiceError('No response from API', 'API_ERROR', true);
      }

      const sanitized = sanitizeJSONResponse(content);
      const recipeNames = JSON.parse(sanitized);
      return Array.isArray(recipeNames) ? recipeNames : [];
    } catch (error) {
      console.error('Failed to generate recipe ideas:', error);
      return [];
    }
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
