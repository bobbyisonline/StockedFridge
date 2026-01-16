import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FridgeRecommendations } from '@/types/fridge.types';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { H2, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface SuggestionsSheetProps {
  recommendations: FridgeRecommendations | null;
  onClose: () => void;
  onShare: () => void;
  onSelectRecipe?: (recipe: string) => void;
  generatingRecipe?: string | null;
  hideShoppingTab?: boolean;
}

export interface SuggestionsSheetRef {
  present: () => void;
  dismiss: () => void;
}

type TabType = 'shopping' | 'recipes';

// FIXED: Define exact header height to prevent content overlap
const HEADER_HEIGHT = 130; // Title + tabs + divider
const DRAG_HANDLE_HEIGHT = 20;

export const SuggestionsSheet = forwardRef<SuggestionsSheetRef, SuggestionsSheetProps>(
  ({ recommendations, onClose, onShare, onSelectRecipe, generatingRecipe, hideShoppingTab = false }, ref) => {
    // Default to recipes tab if we have recipes but no shopping recommendations
    const defaultTab: TabType = hideShoppingTab || (recommendations?.recommendations.length === 0 && recommendations?.possibleRecipes && recommendations.possibleRecipes.length > 0)
      ? 'recipes'
      : 'shopping';
    const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
    const insets = useSafeAreaInsets();
    const bottomSheetRef = React.useRef<BottomSheetModal>(null);

    // Update active tab when recommendations change
    React.useEffect(() => {
      if (recommendations) {
        const newDefaultTab: TabType = hideShoppingTab || (recommendations.recommendations.length === 0 && recommendations.possibleRecipes && recommendations.possibleRecipes.length > 0)
          ? 'recipes'
          : 'shopping';
        setActiveTab(newDefaultTab);
      }
    }, [recommendations, hideShoppingTab]);

    // FIXED: Use proper snap points - 60% and 90% of screen
    const snapPoints = useMemo(() => ['35%', '65%', '95%'], []);

    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    const handleSheetChanges = useCallback((index: number) => {
      console.log('[Assistant] BottomSheet onChange index:', index);
      if (index === -1) {
        onClose();
      }
    }, [onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    // Prepare list data
    const listData = recommendations
      ? (activeTab === 'shopping' 
          ? recommendations.recommendations 
          : recommendations.possibleRecipes || [])
      : [];

    const renderItem = useCallback(({ item }: { item: any }) => {
      if (activeTab === 'shopping') {
        return <IngredientRow item={item} />;
      } else {
        // FIXED: Recipes are now properly actionable with callback
        return (
          <RecipeCard 
            recipe={item} 
            onPress={onSelectRecipe} 
            isGenerating={generatingRecipe === item}
            isDisabled={!!generatingRecipe}
          />
        );
      }
    }, [activeTab, onSelectRecipe, generatingRecipe]);

    const renderEmptyList = useCallback(() => {
      if (activeTab === 'recipes' && listData.length === 0) {
        return (
          <View style={styles.emptyStateWrapper}>
            <EmptyState
              iconName="book"
              title="No recipes available"
              description="We couldn't find recipes with your current ingredients"
              compact
            />
          </View>
        );
      }
      return null;
    }, [activeTab, listData.length]);

    if (!recommendations) return null;

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        onDismiss={() => {
          console.log('[Assistant] BottomSheet onDismiss');
          onClose();
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={true}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        topInset={insets.top}
        enableHandlePanningGesture={true}
        enableContentPanningGesture={true}
      >
        {/* FIXED: Compact header with minimal padding */}
        <View style={styles.header}>
          {/* Title + Close */}
          <View style={styles.titleRow}>
            <H2 style={styles.title}>Smart Suggestions</H2>
            <Pressable 
              onPress={() => { bottomSheetRef.current?.dismiss(); onClose(); }} 
              style={styles.closeButton}
              hitSlop={8}
            >
              <Body style={styles.closeText}>✕</Body>
            </Pressable>
          </View>

          {/* Segmented Control */}
          {!hideShoppingTab && (
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, activeTab === 'shopping' && styles.tabActive]}
                onPress={() => setActiveTab('shopping')}
                hitSlop={4}
              >
                <Caption style={activeTab === 'shopping' ? StyleSheet.flatten([styles.tabText, styles.tabTextActive]) : styles.tabText}>
                  MISSING
                </Caption>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === 'recipes' && styles.tabActive]}
                onPress={() => setActiveTab('recipes')}
                hitSlop={4}
              >
                <Caption style={activeTab === 'recipes' ? StyleSheet.flatten([styles.tabText, styles.tabTextActive]) : styles.tabText}>
                  RECIPES
                </Caption>
              </Pressable>
            </View>
          )}
        </View>

        {/* FIXED: Single divider after header */}
        <View style={styles.headerDivider} />

        {/* FIXED: Use BottomSheetFlatList for proper scrolling */}
        <BottomSheetFlatList
          data={listData}
          keyExtractor={(item: any, index: number) =>
            activeTab === 'shopping'
              ? `ingredient-${item.ingredient?.toString().toLowerCase() || index}`
              : `recipe-${item.toString().toLowerCase().trim()}`
          }
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyList}
          extraData={generatingRecipe}
          ListFooterComponent={activeTab === 'shopping' ? (
            <View style={[styles.footerContainer, { paddingBottom: insets.bottom + SPACING.md }]}>
              <Button
                title="Share Shopping List"
                onPress={onShare}
                variant="primary"
                fullWidth
              />
            </View>
          ) : null}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    );
  }
);

SuggestionsSheet.displayName = 'SuggestionsSheet';

// FIXED: Compact ingredient row with priority pill on right
const IngredientRow: React.FC<{ item: any }> = ({ item }) => {
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Essential';
      case 'medium':
        return 'Optional';
      case 'low':
        return 'Nice to Have';
      default:
        return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return COLORS.primary;
      case 'medium':
        return COLORS.warning || '#F59E0B';
      case 'low':
        return COLORS.textMuted;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <View style={styles.ingredientRow}>
      <Body style={styles.ingredientName} numberOfLines={1}>{item.ingredient}</Body>
      <View style={[styles.priorityPill, { backgroundColor: `${getPriorityColor(item.priority)}20` }]}>
        <Caption style={StyleSheet.flatten([styles.priorityText, { color: getPriorityColor(item.priority) }])}>
          {getPriorityLabel(item.priority)}
        </Caption>
      </View>
    </View>
  );
};

// FIXED: Clearly tappable recipe card with proper press handling
const RecipeCard: React.FC<{ 
  recipe: string;
  onPress?: (recipe: string) => void;
  isGenerating?: boolean;
  isDisabled?: boolean;
}> = ({ recipe, onPress, isGenerating, isDisabled }) => {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.recipeCard,
        isGenerating && styles.recipeCardGenerating,
        pressed && !isDisabled && styles.recipeCardPressed
      ]}
      onPress={() => !isDisabled && onPress?.(recipe)}
      disabled={isDisabled}
    >
      <View style={styles.recipeContent}>
        <Body style={styles.recipeTitle} numberOfLines={2}>{recipe}</Body>
        <View style={styles.recipeTags}>
          <View style={styles.tag}>
            <Caption style={styles.tagText}>Quick</Caption>
          </View>
          <View style={styles.tag}>
            <Caption style={styles.tagText}>Easy</Caption>
          </View>
        </View>
      </View>
      {isGenerating ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Body style={styles.chevron}>›</Body>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.bg,
  },
  handleIndicator: {
    backgroundColor: COLORS.border,
    width: 40,
    height: 4,
  },
  // FIXED: Compact header
  header: {
    backgroundColor: COLORS.bg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  closeText: {
    fontSize: 24,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.surface,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  // FIXED: Single divider
  headerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  // FIXED: List content
  listContent: {
    paddingTop: SPACING.xs,
  },
  // FIXED: Compact ingredient row with pill
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    marginRight: SPACING.md,
  },
  priorityPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // FIXED: Tappable recipe card
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipeCardPressed: {
    backgroundColor: COLORS.surfaceMuted,
    opacity: 0.8,
  },
  recipeCardGenerating: {
    opacity: 0.6,
  },
  recipeContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  recipeTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primarySoft,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chevron: {
    fontSize: 28,
    color: COLORS.textMuted,
    lineHeight: 28,
  },
  // FIXED: Footer container for CTA button
  footerContainer: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md,
  },
  emptyStateWrapper: {
    paddingVertical: SPACING.lg,
  },
});
