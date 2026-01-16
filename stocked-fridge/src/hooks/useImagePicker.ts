import { useState, useCallback } from 'react';
import { CameraService, CameraServiceResult, MultiImageResult } from '@/services/CameraService';
import { ScanError } from '@/types';

interface UseImagePickerReturn {
  pickImage: () => Promise<CameraServiceResult | null>;
  pickMultipleImages: () => Promise<MultiImageResult | null>;
  isPicking: boolean;
  error: ScanError | null;
  clearError: () => void;
}

export function useImagePicker(): UseImagePickerReturn {
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<ScanError | null>(null);

  const pickImage = useCallback(async () => {
    setIsPicking(true);
    setError(null);

    try {
      const result = await CameraService.pickImage();
      
      if (result.cancelled) {
        setIsPicking(false);
        return null;
      }

      setIsPicking(false);
      return result;
    } catch (err) {
      const scanError: ScanError = {
        code: 'PERMISSION_DENIED',
        message: err instanceof Error ? err.message : 'Gallery access denied',
        recoverable: true,
      };
      
      setError(scanError);
      setIsPicking(false);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const pickMultipleImages = useCallback(async () => {
    setIsPicking(true);
    setError(null);

    try {
      const result = await CameraService.pickMultipleImages();
      
      if (result.cancelled) {
        setIsPicking(false);
        return null;
      }

      setIsPicking(false);
      return result;
    } catch (err) {
      const scanError: ScanError = {
        code: 'PERMISSION_DENIED',
        message: err instanceof Error ? err.message : 'Gallery access denied',
        recoverable: true,
      };
      
      setError(scanError);
      setIsPicking(false);
      return null;
    }
  }, []);

  return {
    pickImage,
    pickMultipleImages,
    isPicking,
    error,
    clearError,
  };
}
