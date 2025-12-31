import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScanSessionStore } from '@/store/scanSessionStore';
import { CameraCapture } from '@/components/features/CameraCapture';
import { ImagePreview } from '@/components/features/ImagePreview';
import { RecipeGenerator } from '@/components/features/RecipeGenerator';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { currentSession, startSession, resetSession } = useScanSessionStore();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageCaptured = (uri: string, base64: string) => {
    setCapturedImage(uri);
    startSession(uri);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    resetSession();
    setIsGenerating(false);
  };

  const handleConfirm = () => {
    setIsGenerating(true);
  };

  const handleGenerationComplete = () => {
    if (currentSession?.generatedRecipe) {
      router.push(`/recipe/${currentSession.generatedRecipe.id}`);
      handleRetake();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!capturedImage && (
          <CameraCapture
            onImageCaptured={handleImageCaptured}
            disabled={isGenerating}
          />
        )}

        {capturedImage && !isGenerating && (
          <ImagePreview
            imageUri={capturedImage}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
          />
        )}

        {isGenerating && capturedImage && (
          <RecipeGenerator
            imageUri={capturedImage}
            onComplete={handleGenerationComplete}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
});
