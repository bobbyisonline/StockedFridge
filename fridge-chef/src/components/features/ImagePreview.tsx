import React from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, BORDER_RADIUS, LAYOUT } from '@/constants/theme';
import { Caption, Body } from '@/components/ui/Typography';

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
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Card style={styles.imageCard} padding="none">
          <Image source={{ uri: imageUri }} style={styles.image} />
        </Card>

        <Caption style={styles.helperText}>
          Make sure ingredients are visible and well-lit
        </Caption>

        <View style={styles.buttonContainer}>
          <Button
            title="Retake"
            onPress={onRetake}
            variant="tertiary"
            disabled={isProcessing}
            style={styles.retakeButton}
          />
          
          <Button
            title="Generate Recipe"
            onPress={onConfirm}
            variant="primary"
            size="large"
            disabled={isProcessing}
            loading={isProcessing}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: LAYOUT.screenPadding,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  imageCard: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  helperText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginBottom: SPACING.xxl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  retakeButton: {
    flex: 0,
    paddingHorizontal: SPACING.xl,
  },
  confirmButton: {
    flex: 1,
  },
});
