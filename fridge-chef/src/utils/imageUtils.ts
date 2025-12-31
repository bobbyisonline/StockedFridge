import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { IMAGE_CONFIG } from '@/constants/config';

export interface ImageCompressionResult {
  uri: string;
  base64: string;
  width: number;
  height: number;
  size: number; // bytes
}

/**
 * Compresses and resizes an image for optimal API usage
 */
export async function compressImage(
  uri: string,
  maxWidth: number = IMAGE_CONFIG.MAX_WIDTH,
  maxHeight: number = IMAGE_CONFIG.MAX_HEIGHT,
  quality: number = IMAGE_CONFIG.QUALITY
): Promise<ImageCompressionResult> {
  try {
    // Resize if needed
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { 
        compress: quality, 
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipResult.base64) {
      throw new Error('Failed to generate base64 from image');
    }

    // Get file size
    let size = 0;
    try {
      const fileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
      size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
    } catch (error) {
      console.warn('Failed to get file size:', error);
    }

    return {
      uri: manipResult.uri,
      base64: manipResult.base64,
      width: manipResult.width,
      height: manipResult.height,
      size,
    };
  } catch (error) {
    throw new Error(`Image compression failed: ${error}`);
  }
}

/**
 * Validates if image size is within acceptable limits
 */
export function validateImageSize(sizeInBytes: number): boolean {
  const maxSizeBytes = IMAGE_CONFIG.MAX_SIZE_MB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}

/**
 * Converts bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extracts mime type from image URI
 */
export function getMimeType(uri: string): 'image/jpeg' | 'image/png' {
  const extension = uri.split('.').pop()?.toLowerCase();
  return extension === 'png' ? 'image/png' : 'image/jpeg';
}
