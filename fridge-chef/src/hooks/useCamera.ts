import { useState, useCallback } from 'react';
import { CameraService, CameraServiceResult } from '@/services/CameraService';
import { ScanError } from '@/types';

interface UseCameraReturn {
  captureImage: () => Promise<CameraServiceResult | null>;
  isCapturing: boolean;
  error: ScanError | null;
  clearError: () => void;
}

export function useCamera(): UseCameraReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<ScanError | null>(null);

  const captureImage = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const result = await CameraService.captureImage();
      
      if (result.cancelled) {
        setIsCapturing(false);
        return null;
      }

      setIsCapturing(false);
      return result;
    } catch (err) {
      const scanError: ScanError = {
        code: 'PERMISSION_DENIED',
        message: err instanceof Error ? err.message : 'Camera access denied',
        recoverable: true,
      };
      
      setError(scanError);
      setIsCapturing(false);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    captureImage,
    isCapturing,
    error,
    clearError,
  };
}
