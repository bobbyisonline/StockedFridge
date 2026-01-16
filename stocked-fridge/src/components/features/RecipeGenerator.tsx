import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGenerateRecipe } from '@/hooks/useGenerateRecipe';
import { useScanSessionStore } from '@/store/scanSessionStore';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, LAYOUT } from '@/constants/theme';
import { H2, Body, Caption } from '@/components/ui/Typography';
import { LLMStreamChunk } from '@/types';

interface RecipeGeneratorProps {
  imageUri: string;
  onComplete: () => void;
}

const loadingTips = [
  'Finding perfect recipes...',
  'Checking your pantry...',
  'Analyzing ingredients...',
  'Calculating nutrition...',
  'Almost ready...',
];

export function RecipeGenerator({ imageUri, onComplete }: RecipeGeneratorProps) {
  const { generateWithStreaming, isGenerating } = useGenerateRecipe();
  const { currentSession } = useScanSessionStore();
  const [streamedContent, setStreamedContent] = useState('');
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (imageUri && !isGenerating && !currentSession?.generatedRecipe) {
      handleGenerate();
    }
  }, [imageUri]);

  useEffect(() => {
    if (currentSession?.generatedRecipe) {
      onComplete();
    }
  }, [currentSession?.generatedRecipe]);

  // Rotate tips every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  if (currentSession?.status === 'error') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <Feather name="alert-circle" size={64} color={COLORS.danger} />
          </View>
          <H2 style={styles.errorTitle}>Something went wrong</H2>
          <Body style={styles.errorMessage}>{currentSession.error?.message}</Body>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Card style={styles.progressCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          
          <H2 style={styles.title}>Creating Your Recipe</H2>
          
          <Body style={styles.tip}>{loadingTips[currentTip]}</Body>
          
          {streamedContent && (
            <View style={styles.streamContainer}>
              <Caption style={styles.streamText} numberOfLines={3}>
                {streamedContent}
              </Caption>
            </View>
          )}
        </Card>

        <View style={styles.infoBox}>
          <Caption style={styles.infoText}>
            This usually takes 10-15 seconds
          </Caption>
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
  progressCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  title: {
    textAlign: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  tip: {
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '500',
  },
  streamContainer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    width: '100%',
  },
  streamText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  infoBox: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.infoMuted,
    borderRadius: SPACING.md,
  },
  infoText: {
    textAlign: 'center',
    color: COLORS.info,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  errorIconContainer: {
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    textAlign: 'center',
    color: COLORS.danger,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    textAlign: 'center',
    color: COLORS.textMuted,
  },
});
