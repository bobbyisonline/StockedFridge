import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRecipeStore } from '@/store/recipeStore';
import { useSettingsStore } from '@/store/settingsStore';

export default function RootLayout() {
  const { loadRecipes } = useRecipeStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    // Load initial data
    loadRecipes();
    loadSettings();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="recipe/[id]"
        options={{
          headerShown: true,
          title: 'Recipe Details',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
