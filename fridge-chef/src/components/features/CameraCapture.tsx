import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCamera } from '@/hooks/useCamera';
import { useImagePicker } from '@/hooks/useImagePicker';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING } from '@/constants/theme';
import { Caption } from '@/components/ui/Typography';

interface CameraCaptureProps {
  onImageCaptured: (uri: string, base64: string) => void;
  disabled?: boolean;
}

export function CameraCapture({ onImageCaptured, disabled }: CameraCaptureProps) {
  const { captureImage, isCapturing, error: cameraError } = useCamera();
  const { pickImage, isPicking, error: pickerError } = useImagePicker();

  const handleCapture = async () => {
    const result = await captureImage();
    if (result && !result.cancelled) {
      onImageCaptured(result.uri, result.compressed.base64);
    }
  };

  const handlePick = async () => {
    const result = await pickImage();
    if (result && !result.cancelled) {
      onImageCaptured(result.uri, result.compressed.base64);
    }
  };

  const error = cameraError || pickerError;

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Caption style={styles.errorText}>{error.message}</Caption>
        </View>
      )}

      <Button
        title="📸  Scan Ingredients"
        onPress={handleCapture}
        disabled={disabled || isCapturing || isPicking}
        loading={isCapturing}
        variant="primary"
        size="large"
        fullWidth
        style={styles.primaryButton}
      />
      
      <Button
        title="Upload Photo"
        onPress={handlePick}
        variant="secondary"
        size="medium"
        disabled={disabled || isCapturing || isPicking}
        loading={isPicking}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: COLORS.dangerMuted,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
  },
  primaryButton: {
    marginBottom: SPACING.md,
  },
});
