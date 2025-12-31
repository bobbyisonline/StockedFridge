/**
 * IngredientReviewScreen
 * 
 * Post-photo screen that allows users to:
 * 1) Review detected ingredients
 * 2) Add them to fridge inventory (primary action)
 * 3) Take another photo (secondary action)
 * 4) Generate recipes directly (secondary action)
 * 
 * Flow:
 * - After capture: Shows detected ingredients with ability to remove items
 * - Primary CTA: "Add Ingredients to My Fridge" → adds to inventory + shows confirmation
 * - After adding: Shows success state with 3 next-step options
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, BORDER_RADIUS, LAYOUT } from '@/constants/theme';
import { H2, Body, Caption } from '@/components/ui/Typography';
import { useFridgeStore } from '@/store/fridgeStore';
import { useScanSessionStore } from '@/store/scanSessionStore';
import { LLMService } from '@/services/LLMService';
import { ImageService } from '@/services/ImageService';

interface IngredientReviewScreenProps {
  imageUri: string | string[];
  onRetake: () => void;
  onTakeAnother: () => void;
  onGenerateRecipes: () => void;
}

// Helper component to render single or multiple images
function ImageDisplay({ imageUri }: { imageUri: string | string[] }) {
  const imageUris = Array.isArray(imageUri) ? imageUri : [imageUri];
  
  if (imageUris.length === 1) {
    return (
      <Card style={styles.imageCard} padding="none">
        <Image source={{ uri: imageUris[0] }} style={styles.image} />
      </Card>
    );
  }
  
  return (
    <View style={styles.multiImageContainer}>
      <FlatList
        data={imageUris}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `img-${index}`}
        renderItem={({ item }) => (
          <Card style={styles.multiImageCard} padding="none">
            <Image source={{ uri: item }} style={styles.multiImage} />
          </Card>
        )}
        contentContainerStyle={styles.multiImageList}
      />
      {imageUris.length > 1 && (
        <Caption style={styles.imageCount}>{imageUris.length} photos</Caption>
      )}
    </View>
  );
}

export function IngredientReviewScreen({
  imageUri,
  onRetake,
  onTakeAnother,
  onGenerateRecipes,
}: IngredientReviewScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItemsFromDetection } = useFridgeStore();
  const { currentSession, setDetectedIngredients } = useScanSessionStore();
  
  // State for ingredient detection and management
  const [detectedIngredients, setLocalIngredients] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  // Detect ingredients from image on mount
  useEffect(() => {
    detectIngredients();
  }, [imageUri]);

  const detectIngredients = async () => {
    setIsDetecting(true);
    setDetectionError(null);
    
    try {
      const imageUris = Array.isArray(imageUri) ? imageUri : [imageUri];
      console.log('[IngredientReview] Starting ingredient detection for', imageUris.length, 'image(s)');
      
      // Convert all images to base64
      const base64Array = await Promise.all(
        imageUris.map(async (uri) => {
          const { base64 } = await ImageService.prepareImageForAPI(uri);
          return base64;
        })
      );
      
      console.log('[IngredientReview] Images prepared, processing', base64Array.length, 'image(s)');
      
      // Call LLM to detect ingredients (supports single or multiple images)
      const llmService = new LLMService();
      const result = await llmService.detectIngredients(base64Array.length === 1 ? base64Array[0] : base64Array);
      
      console.log('[IngredientReview] Detected ingredients:', result);
      setLocalIngredients(result);
      setDetectedIngredients(result);
      
    } catch (error) {
      console.error('[IngredientReview] Detection failed:', error);
      setDetectionError('Failed to detect ingredients. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = detectedIngredients.filter((_, i) => i !== index);
    setLocalIngredients(updated);
    setDetectedIngredients(updated);
  };

  const handleAddToFridge = async () => {
    if (detectedIngredients.length === 0) {
      Alert.alert('No Ingredients', 'There are no ingredients to add.');
      return;
    }

    setIsAdding(true);
    
    try {
      console.log('[IngredientReview] Adding ingredients to fridge:', detectedIngredients);
      
      // Use the first image URI for the fridge item
      const firstImageUri = Array.isArray(imageUri) ? imageUri[0] : imageUri;
      
      // Add to fridge store (with duplicate prevention built-in)
      await addItemsFromDetection(detectedIngredients, firstImageUri);
      
      console.log('[IngredientReview] Successfully added to fridge');
      
      // Show success state
      setShowSuccess(true);
      
    } catch (error) {
      console.error('[IngredientReview] Failed to add ingredients:', error);
      Alert.alert('Error', 'Failed to add ingredients. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewFridge = () => {
    router.push('/(tabs)/fridge');
  };

  const handleSeeRecipeIdeas = () => {
    router.push('/(tabs)/recipes');
  };

  // SUCCESS STATE: After adding ingredients
  if (showSuccess) {
    return (
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Body style={styles.successIcon}>✓</Body>
          </View>

          <H2 style={styles.successTitle}>Added to Your Fridge!</H2>
          
          <Body style={styles.successMessage}>
            {detectedIngredients.length} ingredient{detectedIngredients.length !== 1 ? 's' : ''} added successfully
          </Body>

          {/* Next Steps */}
          <View style={styles.nextStepsContainer}>
            <Caption style={styles.nextStepsLabel}>What's next?</Caption>
            
            <Button
              title="Add More Ingredients"
              onPress={onTakeAnother}
              variant="primary"
              fullWidth
              style={styles.nextStepButton}
            />
            
            <Button
              title="View My Fridge"
              onPress={handleViewFridge}
              variant="secondary"
              fullWidth
              style={styles.nextStepButton}
            />
            
            <Button
              title="See Recipe Ideas"
              onPress={handleSeeRecipeIdeas}
              variant="tertiary"
              fullWidth
              style={styles.nextStepButton}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  // DETECTION ERROR STATE
  if (detectionError) {
    return (
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ImageDisplay imageUri={imageUri} />

          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Feather name="alert-circle" size={48} color={COLORS.danger} />
            </View>
            <Body style={styles.errorText}>{detectionError}</Body>
          </View>

          {/* Action buttons pinned to bottom */}
          <View style={styles.actionContainer}>
            <Button
              title="Try Again"
              onPress={detectIngredients}
              variant="primary"
              fullWidth
              style={styles.primaryButton}
            />
            
            <View style={styles.secondaryActions}>
              <Button
                title="Retake Photo"
                onPress={onRetake}
                variant="tertiary"
              />
              <Button
                title="Upload Another"
                onPress={onTakeAnother}
                variant="tertiary"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // LOADING STATE: Detecting ingredients
  if (isDetecting) {
    return (
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ImageDisplay imageUri={imageUri} />

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Body style={styles.loadingText}>Detecting ingredients...</Body>
            <Caption style={styles.loadingHint}>This usually takes a few seconds</Caption>
          </View>
        </View>
      </ScrollView>
    );
  }

  // NO INGREDIENTS DETECTED
  if (detectedIngredients.length === 0 && !isDetecting) {
    return (
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ImageDisplay imageUri={imageUri} />

          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="camera" size={48} color={COLORS.textMuted} />
            </View>
            <Body style={styles.emptyTitle}>No Ingredients Detected</Body>
            <Caption style={styles.emptyMessage}>
              Make sure ingredients are visible and well-lit in the photo
            </Caption>
          </View>

          {/* Action buttons */}
          <View style={styles.actionContainer}>
            <View style={styles.secondaryActions}>
              <Button
                title="Retake Photo"
                onPress={onRetake}
                variant="secondary"
              />
              <Button
                title="Upload Another"
                onPress={onTakeAnother}
                variant="tertiary"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // MAIN REVIEW STATE: Show detected ingredients
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <ImageDisplay imageUri={imageUri} />

        {/* Detected Ingredients Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Detected Ingredients</H2>
          <Caption style={styles.sectionHint}>
            Tap ✕ to remove any item you don't want to add
          </Caption>

          <View style={styles.ingredientsList}>
            {detectedIngredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <Body style={styles.ingredientName}>{ingredient}</Body>
                <Pressable
                  onPress={() => handleRemoveIngredient(index)}
                  style={styles.removeButton}
                  hitSlop={8}
                >
                  <Body style={styles.removeIcon}>✕</Body>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions - Always visible, respects safe area */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          title={`Add ${detectedIngredients.length} Ingredient${detectedIngredients.length !== 1 ? 's' : ''} to My Fridge`}
          onPress={handleAddToFridge}
          variant="primary"
          fullWidth
          disabled={isAdding || detectedIngredients.length === 0}
          loading={isAdding}
          style={styles.primaryButton}
        />
        
        <View style={styles.secondaryActions}>
          <Button
            title="Take Another Photo"
            onPress={onTakeAnother}
            variant="tertiary"
            disabled={isAdding}
          />
          <Button
            title="Generate Recipes"
            onPress={onGenerateRecipes}
            variant="secondary"
            disabled={isAdding}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: LAYOUT.screenPadding,
  },
  scrollContainer: {
    padding: LAYOUT.screenPadding,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Image
  imageCard: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  multiImageContainer: {
    marginBottom: SPACING.lg,
  },
  multiImageList: {
    paddingRight: SPACING.md,
  },
  multiImageCard: {
    width: 250,
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  multiImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageCount: {
    textAlign: 'center',
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Detected Ingredients Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  ingredientsList: {
    gap: SPACING.xs,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  removeIcon: {
    fontSize: 20,
    color: COLORS.textMuted,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  loadingText: {
    marginTop: SPACING.lg,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loadingHint: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    textAlign: 'center',
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.xl,
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  errorIconContainer: {
    marginBottom: SPACING.md,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.danger,
    paddingHorizontal: SPACING.xl,
  },

  // Success State
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  successIcon: {
    fontSize: 48,
    color: COLORS.success,
    fontWeight: '600',
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successMessage: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginBottom: SPACING.xxl,
  },
  nextStepsContainer: {
    width: '100%',
  },
  nextStepsLabel: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  nextStepButton: {
    marginBottom: SPACING.md,
  },

  // Bottom Actions (Fixed)
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bg,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 8,
  },
  primaryButton: {
    marginBottom: SPACING.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  actionContainer: {
    marginTop: 'auto',
  },
});
