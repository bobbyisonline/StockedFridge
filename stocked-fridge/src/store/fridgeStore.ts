import { create } from 'zustand';
import { FridgeItem, FridgeItemInput } from '@/types/fridge.types';
import { StorageService } from '@/services/StorageService';

interface FridgeState {
  items: FridgeItem[];
  isLoading: boolean;
  
  // Actions
  loadItems: () => Promise<void>;
  addItem: (item: FridgeItemInput) => Promise<void>;
  addItemsFromDetection: (detectedItems: string[], imageUri?: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<FridgeItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  markAsUsed: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  searchItems: (query: string) => FridgeItem[];
  filterByCategory: (category: string) => FridgeItem[];
}

export const useFridgeStore = create<FridgeState>((set, get) => ({
  items: [],
  isLoading: false,

  loadItems: async () => {
    set({ isLoading: true });
    try {
      const items = await StorageService.getFridgeItems();
      set({ items, isLoading: false });
    } catch (error) {
      console.error('Failed to load fridge items:', error);
      set({ isLoading: false });
    }
  },

  addItem: async (itemInput: FridgeItemInput) => {
    const newItem: FridgeItem = {
      ...itemInput,
      id: `fridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date(),
    };

    const updatedItems = [...get().items, newItem];
    set({ items: updatedItems });
    
    try {
      await StorageService.saveFridgeItems(updatedItems);
    } catch (error) {
      console.error('Failed to save fridge item:', error);
    }
  },

  addItemsFromDetection: async (detectedItems: string[], imageUri?: string) => {
    console.log('addItemsFromDetection called with:', detectedItems);
    
    const newItems: FridgeItem[] = detectedItems.map(name => ({
      id: `fridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      category: 'other',
      addedAt: new Date(),
      imageUri,
    }));

    const existingItems = get().items;
    console.log('Existing fridge items:', existingItems.length);
    
    // Filter out duplicates (case-insensitive name match)
    const uniqueNewItems = newItems.filter(newItem => 
      !existingItems.some(existing => 
        existing.name.toLowerCase() === newItem.name.toLowerCase()
      )
    );

    console.log('Unique new items to add:', uniqueNewItems.length, uniqueNewItems);
    
    if (uniqueNewItems.length === 0) {
      console.log('No new items to add (all duplicates)');
      return;
    }

    const updatedItems = [...existingItems, ...uniqueNewItems];
    set({ items: updatedItems });
    console.log('Updated store with new items, total:', updatedItems.length);
    
    try {
      await StorageService.saveFridgeItems(updatedItems);
      console.log('Saved to storage successfully');
    } catch (error) {
      console.error('Failed to save detected items:', error);
    }
  },

  updateItem: async (id: string, updates: Partial<FridgeItem>) => {
    const updatedItems = get().items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    
    set({ items: updatedItems });
    
    try {
      await StorageService.saveFridgeItems(updatedItems);
    } catch (error) {
      console.error('Failed to update fridge item:', error);
    }
  },

  removeItem: async (id: string) => {
    const updatedItems = get().items.filter(item => item.id !== id);
    set({ items: updatedItems });
    
    try {
      await StorageService.saveFridgeItems(updatedItems);
    } catch (error) {
      console.error('Failed to remove fridge item:', error);
    }
  },

  markAsUsed: async (id: string) => {
    const updatedItems = get().items.map(item =>
      item.id === id ? { ...item, lastUsedAt: new Date() } : item
    );
    
    set({ items: updatedItems });
    
    try {
      await StorageService.saveFridgeItems(updatedItems);
    } catch (error) {
      console.error('Failed to mark item as used:', error);
    }
  },

  clearAll: async () => {
    set({ items: [] });
    try {
      await StorageService.saveFridgeItems([]);
    } catch (error) {
      console.error('Failed to clear fridge:', error);
    }
  },

  searchItems: (query: string) => {
    const lowerQuery = query.toLowerCase();
    return get().items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.notes?.toLowerCase().includes(lowerQuery)
    );
  },

  filterByCategory: (category: string) => {
    return get().items.filter(item => item.category === category);
  },
}));
