import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface ImagePreviewProps {
  imageUri: string;
  onRetake: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function ImagePreview({
  imageUri,
  onRetake,
  onConfirm,
  isProcessing = false,
}: ImagePreviewProps) {
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Preview Your Image</Text>
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Retake"
          onPress={onRetake}
          variant="outline"
          disabled={isProcessing}
          style={styles.button}
        />
        
        <Button
          title="Generate Recipe"
          onPress={onConfirm}
          disabled={isProcessing}
          loading={isProcessing}
          style={styles.button}
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
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
  },
});
