import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useCamera } from '@/hooks/useCamera';
import { useImagePicker } from '@/hooks/useImagePicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

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
    <Card style={styles.container}>
      <Text style={styles.title}>Capture Your Ingredients</Text>
      <Text style={styles.subtitle}>
        Take a photo or choose from your gallery to get started
      </Text>

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📸</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Take Photo"
          onPress={handleCapture}
          disabled={disabled || isCapturing || isPicking}
          loading={isCapturing}
          fullWidth
          style={styles.button}
        />
        
        <Button
          title="Choose from Gallery"
          onPress={handlePick}
          variant="outline"
          disabled={disabled || isCapturing || isPicking}
          loading={isPicking}
          fullWidth
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 64,
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}10`,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    width: '100%',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  button: {
    marginBottom: SPACING.sm,
  },
});
