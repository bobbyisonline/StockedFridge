import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGenerateRecipe } from '@/hooks/useGenerateRecipe';
import { useScanSessionStore } from '@/store/scanSessionStore';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { LLMStreamChunk } from '@/types';

interface RecipeGeneratorProps {
  imageUri: string;
  onComplete: () => void;
}

export function RecipeGenerator({ imageUri, onComplete }: RecipeGeneratorProps) {
  const { generateWithStreaming, isGenerating } = useGenerateRecipe();
  const { currentSession } = useScanSessionStore();
  const [streamedContent, setStreamedContent] = useState('');

  React.useEffect(() => {
    if (imageUri && !isGenerating && !currentSession?.generatedRecipe) {
      handleGenerate();
    }
  }, [imageUri]);

  React.useEffect(() => {
    if (currentSession?.generatedRecipe) {
      onComplete();
    }
  }, [currentSession?.generatedRecipe]);

  const handleGenerate = async () => {
    setStreamedContent('');
    
    await generateWithStreaming(
      imageUri,
      (chunk: LLMStreamChunk) => {
        if (!chunk.isComplete) {
          setStreamedContent((prev) => prev + chunk.content);
        }
      }
    );
  };

  const getStatusMessage = () => {
    switch (currentSession?.status) {
      case 'processing':
        return 'Preparing image...';
      case 'analyzing':
        return 'Analyzing ingredients...';
      case 'streaming':
        return 'Generating your recipe...';
      case 'error':
        return currentSession.error?.message || 'An error occurred';
      default:
        return 'Processing...';
    }
  };

  if (currentSession?.status === 'error') {
    return (
      <Card style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{currentSession.error?.message}</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Creating Your Recipe</Text>
      
      <LoadingSpinner message={getStatusMessage()} />

      {streamedContent && (
        <ScrollView style={styles.streamContainer}>
          <Text style={styles.streamText}>{streamedContent}</Text>
        </ScrollView>
      )}

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          💡 This usually takes 10-15 seconds
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 300,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  streamContainer: {
    maxHeight: 200,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  streamText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  tipContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: `${COLORS.info}10`,
    borderRadius: 8,
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
