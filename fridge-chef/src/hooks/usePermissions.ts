import { useState, useCallback } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface UsePermissionsReturn {
  hasCameraPermission: boolean | null;
  hasGalleryPermission: boolean | null;
  hasNotificationPermission: boolean | null;
  requestCameraPermission: () => Promise<boolean>;
  requestGalleryPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
  checkAllPermissions: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean | null>(null);

  const requestCameraPermission = useCallback(async () => {
    try {
      const { Camera } = await import('expo-camera');
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      setHasCameraPermission(granted);
      return granted;
    } catch (error) {
      console.error('Camera permission request failed:', error);
      return false;
    }
  }, []);

  const requestGalleryPermission = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = status === 'granted';
      setHasGalleryPermission(granted);
      return granted;
    } catch (error) {
      console.error('Gallery permission request failed:', error);
      return false;
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      setHasNotificationPermission(granted);
      return granted;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return false;
    }
  }, []);

  const checkAllPermissions = useCallback(async () => {
    try {
      const { Camera } = await import('expo-camera');
      const ImagePicker = await import('expo-image-picker');

      const cameraStatus = await Camera.getCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');

      if (Device.isDevice) {
        const notifStatus = await Notifications.getPermissionsAsync();
        setHasNotificationPermission(notifStatus.status === 'granted');
      }
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  }, []);

  return {
    hasCameraPermission,
    hasGalleryPermission,
    hasNotificationPermission,
    requestCameraPermission,
    requestGalleryPermission,
    requestNotificationPermission,
    checkAllPermissions,
  };
}
