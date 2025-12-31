import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store/settingsStore';
import { useRecipeStore } from '@/store/recipeStore';
import { StorageService } from '@/services/StorageService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    servingsDefault,
    dietaryRestrictions,
    preferredCuisines,
    toggleNotifications,
    setServingsDefault,
  } = useSettingsStore();

  const { recipes } = useRecipeStore();

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
              await StorageService.clearAll();
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Statistics Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Recipes</Text>
            <Text style={styles.statValue}>{recipes.length}</Text>
          </View>
        </Card>

        {/* Preferences Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Servings</Text>
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
                  <Text
                    style={[
                      styles.servingButtonText,
                      servingsDefault === num && styles.servingButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Dietary Restrictions Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          {dietaryRestrictions.length === 0 ? (
            <Text style={styles.emptyText}>No restrictions set</Text>
          ) : (
            <View style={styles.tagContainer}>
              {dietaryRestrictions.map((restriction) => (
                <View key={restriction} style={styles.tag}>
                  <Text style={styles.tagText}>{restriction}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* About Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>Fridge Chef v1.0.0</Text>
          <Text style={styles.aboutDescription}>
            Transform your ingredients into delicious recipes using AI
          </Text>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <Button
            title="Clear All Data"
            onPress={handleClearData}
            variant="outline"
            fullWidth
          />
        </Card>
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
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  servingsButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  servingButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  servingButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  servingButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  servingButtonTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  aboutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  aboutDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  dangerCard: {
    marginBottom: SPACING.md,
    borderColor: COLORS.error,
    borderWidth: 1,
  },
});
