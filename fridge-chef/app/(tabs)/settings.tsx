import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useRecipeStore } from '@/store/recipeStore';
import { useFridgeStore } from '@/store/fridgeStore';
import { useScanSessionStore } from '@/store/scanSessionStore';
import { StorageService } from '@/services/StorageService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, LAYOUT } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { H1, H2, Body, Caption } from '@/components/ui/Typography';
import { Divider } from '@/components/ui/Divider';

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    servingsDefault,
    dietaryRestrictions,
    toggleNotifications,
    setServingsDefault,
    reset: resetSettings,
  } = useSettingsStore();

  const { recipes, reset: resetRecipes } = useRecipeStore();
  const { clearAll: clearFridge } = useFridgeStore();
  const { resetSession } = useScanSessionStore();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your recipes and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await StorageService.clearAll();
              
              // Reset all Zustand stores
              resetRecipes();
              resetSettings();
              clearFridge();
              resetSession();
              
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <H1 style={styles.title}>Settings</H1>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>STATISTICS</Caption>
          <Card variant="filled">
            <View style={styles.statRow}>
              <Body>Total Recipes</Body>
              <H2 style={styles.statValue}>{recipes.length}</H2>
            </View>
          </Card>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>PREFERENCES</Caption>
          <Card variant="filled">
            <View style={styles.settingRow}>
              <Body>Notifications</Body>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.primaryTextOn}
              />
            </View>

            <Divider spacing="none" style={styles.divider} />

            <View style={styles.settingRow}>
              <Body style={styles.settingLabel}>Default Servings</Body>
            </View>
            <View style={styles.servingsButtons}>
              {[1, 2, 4, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.servingButton,
                    servingsDefault === num && styles.servingButtonActive,
                  ]}
                  onPress={() => setServingsDefault(num)}
                >
                  <Body
                    color={servingsDefault === num ? COLORS.primary : COLORS.text}
                    style={
                      servingsDefault === num
                        ? styles.servingButtonTextActive
                        : styles.servingButtonText
                    }
                  >
                    {num}
                  </Body>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Dietary Restrictions Section */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>DIETARY RESTRICTIONS</Caption>
          <Card variant="filled">
            {dietaryRestrictions.length === 0 ? (
              <View>
                <Caption style={styles.emptyText}>No restrictions set</Caption>
                <Button
                  title="Set Dietary Preferences"
                  onPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
                  variant="tertiary"
                  size="small"
                  style={styles.addButton}
                />
              </View>
            ) : (
              <View style={styles.tagContainer}>
                {dietaryRestrictions.map((restriction) => (
                  <View key={restriction} style={styles.tag}>
                    <Caption style={styles.tagText}>{restriction}</Caption>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>ABOUT</Caption>
          <Card variant="filled">
            <Body style={styles.aboutVersion}>StockedFridge v1.0.0</Body>
            <Caption style={styles.aboutDescription}>
              Transform your ingredients into delicious recipes using AI
            </Caption>
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Caption style={styles.dangerLabel}>DANGER ZONE</Caption>
          <Button
            title="Clear All Data"
            onPress={handleClearData}
            variant="outline"
            fullWidth
            style={styles.dangerButton}
          />
          <Caption style={styles.dangerNote}>
            This will delete all your recipes and settings permanently
          </Caption>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  title: {
    marginBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionLabel: {
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    color: COLORS.textMuted,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: LAYOUT.minTapTarget,
  },
  settingLabel: {
    flex: 1,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  servingsButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  servingButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  servingButtonActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  servingButtonText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  servingButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: SPACING.md,
  },
  tagText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  aboutVersion: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  aboutDescription: {
    color: COLORS.textMuted,
  },
  dangerLabel: {
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    color: COLORS.danger,
  },
  dangerButton: {
    borderColor: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  dangerNote: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
