import * as ImagePicker from 'expo-image-picker';
import { compressImage, ImageCompressionResult } from '@/utils/imageUtils';

export interface CameraServiceResult {
  uri: string;
  compressed: ImageCompressionResult;
  cancelled: boolean;
}

export interface MultiImageResult {
  images: Array<{
    uri: string;
    compressed: ImageCompressionResult;
  }>;
  cancelled: boolean;
}

export class CameraService {
  /**
   * Requests camera permissions
   */
  static async requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Requests media library permissions
   */
  static async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Checks if camera permission is granted
   */
  static async hasCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Checks if media library permission is granted
   */
  static async hasMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Launches the camera to capture an image
   */
  static async captureImage(): Promise<CameraServiceResult> {
    const hasPermission = await this.hasCameraPermission();
    if (!hasPermission) {
      const granted = await this.requestCameraPermission();
      if (!granted) {
        throw new Error('Camera permission denied');
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return { uri: '', compressed: {} as ImageCompressionResult, cancelled: true };
    }

    const compressed = await compressImage(result.assets[0].uri);

    return {
      uri: result.assets[0].uri,
      compressed,
      cancelled: false,
    };
  }

  /**
   * Launches the image picker to select from gallery
   */
  static async pickImage(): Promise<CameraServiceResult> {
    const hasPermission = await this.hasMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await this.requestMediaLibraryPermission();
      if (!granted) {
        throw new Error('Media library permission denied');
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return { uri: '', compressed: {} as ImageCompressionResult, cancelled: true };
    }

    const compressed = await compressImage(result.assets[0].uri);

    return {
      uri: result.assets[0].uri,
      compressed,
      cancelled: false,
    };
  }

  /**
   * Launches the image picker to select multiple images from gallery
   */
  static async pickMultipleImages(): Promise<MultiImageResult> {
    const hasPermission = await this.hasMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await this.requestMediaLibraryPermission();
      if (!granted) {
        throw new Error('Media library permission denied');
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled || !result.assets) {
      return { images: [], cancelled: true };
    }

    // Compress all selected images
    const images = await Promise.all(
      result.assets.map(async (asset) => {
        const compressed = await compressImage(asset.uri);
        return {
          uri: asset.uri,
          compressed,
        };
      })
    );

    return {
      images,
      cancelled: false,
    };
  }
}
