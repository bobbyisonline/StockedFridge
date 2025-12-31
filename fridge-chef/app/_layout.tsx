import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRecipeStore } from '@/store/recipeStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useFridgeStore } from '@/store/fridgeStore';

export default function RootLayout() {
  const { loadRecipes } = useRecipeStore();
  const { loadSettings } = useSettingsStore();
  const { loadItems } = useFridgeStore();

  useEffect(() => {
    // Load initial data
    loadRecipes();
    loadSettings();
    loadItems();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
