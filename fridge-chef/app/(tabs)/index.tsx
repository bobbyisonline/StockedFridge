import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image } from 'react-native';
import { useScanSessionStore } from '@/store/scanSessionStore';
import { CameraCapture } from '@/components/features/CameraCapture';
import { ImagePreview } from '@/components/features/ImagePreview';
import { RecipeGenerator } from '@/components/features/RecipeGenerator';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, LAYOUT } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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

  // Show preview state
  if (capturedImage && !isGenerating) {
    return (
      <Screen padding={false}>
        <ImagePreview
          imageUri={capturedImage}
          onRetake={handleRetake}
          onConfirm={handleConfirm}
        />
      </Screen>
    );
  }

  // Show loading/generating state
  if (isGenerating && capturedImage) {
    return (
      <Screen padding={false}>
        <RecipeGenerator
          imageUri={capturedImage}
          onComplete={handleGenerationComplete}
        />
      </Screen>
    );
  }

  // Show home/capture state
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Body style={styles.tagline}>
            Turn what you have into meals
          </Body>
        </View>

        {/* Primary Actions */}
        <View style={styles.actions}>
          <CameraCapture
            onImageCaptured={handleImageCaptured}
            disabled={isGenerating}
          />
        </View>

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Caption style={styles.howItWorksTitle}>How it works</Caption>
          
          <Card style={styles.stepCard} variant="filled">
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Body style={styles.stepTitle}>Capture Ingredients</Body>
                <Caption>Snap a photo of what's in your fridge</Caption>
              </View>
            </View>
          </Card>

          <Card style={styles.stepCard} variant="filled">
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Body style={styles.stepTitle}>AI Creates Recipe</Body>
                <Caption>Our AI generates a custom recipe instantly</Caption>
              </View>
            </View>
          </Card>

          <Card style={styles.stepCard} variant="filled">
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Body style={styles.stepTitle}>Cook & Enjoy</Body>
                <Caption>Follow step-by-step instructions to make your meal</Caption>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  tagline: {
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  actions: {
    marginBottom: SPACING.xl,
  },
  howItWorks: {
    marginTop: SPACING.md,
  },
  howItWorksTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  stepCard: {
    marginBottom: SPACING.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    color: COLORS.primaryTextOn,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: SPACING.md,
    includeFontPadding: false,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
});
