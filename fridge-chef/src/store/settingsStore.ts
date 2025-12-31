import { create } from 'zustand';
import { StorageService, UserSettings } from '@/services/StorageService';

interface SettingsState extends UserSettings {
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  addDietaryRestriction: (restriction: string) => Promise<void>;
  removeDietaryRestriction: (restriction: string) => Promise<void>;
  addPreferredCuisine: (cuisine: string) => Promise<void>;
  removePreferredCuisine: (cuisine: string) => Promise<void>;
  setServingsDefault: (servings: number) => Promise<void>;
  toggleNotifications: () => Promise<void>;
  reset: () => void;
}

const defaultSettings: UserSettings = {
  dietaryRestrictions: [],
  preferredCuisines: [],
  servingsDefault: 2,
  notificationsEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await StorageService.getSettings();
      set({ ...settings, isLoading: false });
    } catch (error) {
      set({ error: `Failed to load settings: ${error}`, isLoading: false });
    }
  },

  updateSettings: async (newSettings: Partial<UserSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const currentSettings = {
        dietaryRestrictions: get().dietaryRestrictions,
        preferredCuisines: get().preferredCuisines,
        servingsDefault: get().servingsDefault,
        notificationsEnabled: get().notificationsEnabled,
      };
      
      const updatedSettings = { ...currentSettings, ...newSettings };
      await StorageService.saveSettings(updatedSettings);
      set({ ...updatedSettings, isLoading: false });
    } catch (error) {
      set({ error: `Failed to update settings: ${error}`, isLoading: false });
    }
  },

  addDietaryRestriction: async (restriction: string) => {
    const current = get().dietaryRestrictions;
    if (!current.includes(restriction)) {
      await get().updateSettings({
        dietaryRestrictions: [...current, restriction],
      });
    }
  },

  removeDietaryRestriction: async (restriction: string) => {
    const current = get().dietaryRestrictions;
    await get().updateSettings({
      dietaryRestrictions: current.filter((r) => r !== restriction),
    });
  },

  addPreferredCuisine: async (cuisine: string) => {
    const current = get().preferredCuisines;
    if (!current.includes(cuisine)) {
      await get().updateSettings({
        preferredCuisines: [...current, cuisine],
      });
    }
  },

  removePreferredCuisine: async (cuisine: string) => {
    const current = get().preferredCuisines;
    await get().updateSettings({
      preferredCuisines: current.filter((c) => c !== cuisine),
    });
  },

  setServingsDefault: async (servings: number) => {
    await get().updateSettings({ servingsDefault: servings });
  },

  toggleNotifications: async () => {
    await get().updateSettings({
      notificationsEnabled: !get().notificationsEnabled,
    });
  },

  reset: () => {
    set({ ...defaultSettings, isLoading: false, error: null });
  },
}));
