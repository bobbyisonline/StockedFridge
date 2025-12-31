import { useCallback } from 'react';
import { LLMService, LLMServiceError } from '@/services/LLMService';
import { ImageService } from '@/services/ImageService';
import { useScanSessionStore } from '@/store/scanSessionStore';
import { useRecipeStore } from '@/store/recipeStore';
import { useFridgeStore } from '@/store/fridgeStore';
import { LLMRequest, LLMStreamChunk } from '@/types';

interface UseGenerateRecipeReturn {
  generateFromImage: (imageUri: string, options?: Partial<LLMRequest>) => Promise<void>;
  generateWithStreaming: (
    imageUri: string,
    onChunk: (chunk: LLMStreamChunk) => void,
    options?: Partial<LLMRequest>
  ) => Promise<void>;
  isGenerating: boolean;
}

const llmService = new LLMService();

export function useGenerateRecipe(): UseGenerateRecipeReturn {
  const {
    currentSession,
    updateStatus,
    setImageBase64,
    setGeneratedRecipe,
    setError,
    completeSession,
  } = useScanSessionStore();
  
  const { addRecipe } = useRecipeStore();
  const { addItemsFromDetection } = useFridgeStore();

  const isGenerating = currentSession?.status === 'processing' || 
                       currentSession?.status === 'analyzing' ||
                       currentSession?.status === 'streaming';

  const generateFromImage = useCallback(
    async (imageUri: string, options?: Partial<LLMRequest>) => {
      try {
        updateStatus('processing');

        // Prepare image
        const compressed = await ImageService.prepareImageForAPI(imageUri);
        setImageBase64(compressed.base64);

        updateStatus('analyzing');

        // Generate recipe
        const request: LLMRequest = {
          imageBase64: compressed.base64,
          mimeType: ImageService.getMimeType(imageUri),
          ...options,
        };

        const response = await llmService.generateRecipeFromImage(request);

        // Save recipe
        setGeneratedRecipe(response.recipe);
        await addRecipe(response.recipe);
        
        // Add detected items to fridge
        console.log('Detected items from LLM:', response.detectedItems);
        if (response.detectedItems && response.detectedItems.length > 0) {
          console.log('Adding items to fridge:', response.detectedItems);
          await addItemsFromDetection(response.detectedItems, imageUri);
          console.log('Items added to fridge successfully');
        } else {
          console.log('No detected items to add to fridge');
        }
        
        completeSession();
      } catch (error) {
        if (error instanceof LLMServiceError) {
          setError({
            code: error.code,
            message: error.message,
            recoverable: error.recoverable,
          });
        } else {
          setError({
            code: 'API_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: true,
          });
        }
        completeSession();
      }
    },
    [updateStatus, setImageBase64, setGeneratedRecipe, setError, completeSession, addRecipe, addItemsFromDetection]
  );

  const generateWithStreaming = useCallback(
    async (
      imageUri: string,
      onChunk: (chunk: LLMStreamChunk) => void,
      options?: Partial<LLMRequest>
    ) => {
      try {
        updateStatus('processing');

        // Prepare image
        const compressed = await ImageService.prepareImageForAPI(imageUri);
        setImageBase64(compressed.base64);

        updateStatus('streaming');

        // Generate recipe with streaming
        const request: LLMRequest = {
          imageBase64: compressed.base64,
          mimeType: ImageService.getMimeType(imageUri),
          stream: true,
          ...options,
        };

        const response = await llmService.generateRecipeStreamAsync(request, onChunk);

        // Save recipe
        setGeneratedRecipe(response.recipe);
        await addRecipe(response.recipe);
        
        // Add detected items to fridge
        console.log('Detected items from LLM:', response.detectedItems);
        if (response.detectedItems && response.detectedItems.length > 0) {
          console.log('Adding items to fridge:', response.detectedItems);
          await addItemsFromDetection(response.detectedItems, imageUri);
          console.log('Items added to fridge successfully');
        } else {
          console.log('No detected items to add to fridge');
        }
        
        completeSession();
      } catch (error) {
        if (error instanceof LLMServiceError) {
          setError({
            code: error.code,
            message: error.message,
            recoverable: error.recoverable,
          });
        } else {
          setError({
            code: 'API_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: true,
          });
        }
        completeSession();
      }
    },
    [updateStatus, setImageBase64, setGeneratedRecipe, setError, completeSession, addRecipe, addItemsFromDetection]
  );

  return {
    generateFromImage,
    generateWithStreaming,
    isGenerating,
  };
}
