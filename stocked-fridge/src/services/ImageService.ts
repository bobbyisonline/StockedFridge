import { compressImage, validateImageSize, getMimeType } from '@/utils/imageUtils';
import type { ImageCompressionResult } from '@/utils/imageUtils';
import { IMAGE_CONFIG } from '@/constants/config';

export class ImageService {
  /**
   * Prepares an image for API submission (compress, validate, convert to base64)
   */
  static async prepareImageForAPI(uri: string): Promise<ImageCompressionResult> {
    // Compress the image
    const compressed = await compressImage(
      uri,
      IMAGE_CONFIG.MAX_WIDTH,
      IMAGE_CONFIG.MAX_HEIGHT,
      IMAGE_CONFIG.QUALITY
    );

    // Validate size
    if (!validateImageSize(compressed.size)) {
      throw new Error(`Image too large. Maximum size is ${IMAGE_CONFIG.MAX_SIZE_MB}MB`);
    }

    return compressed;
  }

  /**
   * Gets the mime type from a URI
   */
  static getMimeType(uri: string): 'image/jpeg' | 'image/png' {
    return getMimeType(uri);
  }

  /**
   * Validates if the URI is a valid image
   */
  static isValidImageUri(uri: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const lowerUri = uri.toLowerCase();
    return validExtensions.some(ext => lowerUri.includes(ext));
  }
}
